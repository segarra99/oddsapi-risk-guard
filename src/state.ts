import type {
    Fixture,
    Bookmaker,
    BookmakersPayload,
    Odds,
    OddsPayload,
} from "./schemas/index.js";
import type { Epoch } from "./types/index.js";

type Versioned<T> = {
    ts: number;
    data: T;
};

export class State {
    // store stream position so reconnects can resume without replaying the full history
    private epoch: Epoch = {
        serverEpoch: "",
        lastSeenId: {},
    };

    private fixtures = new Map<string, Versioned<Fixture>>();

    private bookmakers = new Map<string, Map<string, Versioned<Bookmaker>>>();

    private odds = new Map<string, Map<string, Map<string, Versioned<Odds>>>>();

    getEpoch() {
        return this.epoch;
    }

    updateEpoch(channel: string, entryId: string, serverEpoch?: string) {
        // update server epoch when the websocket provides a newer stream generation
        if (serverEpoch) this.epoch.serverEpoch = serverEpoch;

        // store the latest successfully processed entry for the channel
        this.epoch.lastSeenId[channel] = entryId;
    }

    applyFixture(payload: Fixture, ts: number, entryId: string) {
        const existing = this.fixtures.get(payload.fixtureId);

        // ignore fixture updates that cannot move the current state forward
        if (existing && existing.ts >= ts) {
            return;
        }

        this.fixtures.set(payload.fixtureId, {
            ts,
            data: payload,
        });

        // advance cursor after fixture state has been accepted
        this.updateEpoch("fixtures", entryId);
    }

    applyBookmakers(payload: BookmakersPayload, ts: number, entryId: string) {
        // ignore bookmaker state when the parent fixture is unavailable
        if (!this.fixtures.has(payload.fixtureId)) {
            return;
        }

        let fixtureBookmakers = this.bookmakers.get(payload.fixtureId);

        // create bookmaker storage only when a fixture receives bookmaker data
        if (!fixtureBookmakers) {
            fixtureBookmakers = new Map();
            this.bookmakers.set(payload.fixtureId, fixtureBookmakers);
        }

        for (const bookmaker of Object.values(payload.bookmakers)) {
            const existing = fixtureBookmakers.get(bookmaker.bookmaker);

            // ignore bookmaker updates that cannot move the current state forward
            if (existing && existing.ts >= ts) {
                continue;
            }

            fixtureBookmakers.set(bookmaker.bookmaker, {
                ts,
                data: bookmaker,
            });

            // remove odds because bookmaker state no longer guarantees valid prices
            if (
                bookmaker.staleOdds ||
                bookmaker.suspended ||
                !bookmaker.hasOdds
            ) {
                this.odds.get(payload.fixtureId)?.delete(bookmaker.bookmaker);
            }
        }

        // advance cursor after bookmaker state has been accepted
        this.updateEpoch("bookmakers", entryId);
    }

    applyOdds(payload: OddsPayload, ts: number, entryId: string) {
        // ignore odds state when the parent fixture is unavailable
        if (!this.fixtures.has(payload.fixtureId)) {
            return;
        }

        const fixtureBookmakers = this.bookmakers.get(payload.fixtureId);

        // ignore odds state when bookmaker state is unavailable
        if (!fixtureBookmakers) {
            return;
        }

        let fixtureOdds = this.odds.get(payload.fixtureId);

        // create odds storage only when a fixture receives valid odds
        if (!fixtureOdds) {
            fixtureOdds = new Map();
            this.odds.set(payload.fixtureId, fixtureOdds);
        }

        for (const [bookmakerName, odds] of Object.entries(payload.odds)) {
            const bookmaker = fixtureBookmakers.get(bookmakerName);

            // ignore odds from bookmakers that cannot provide usable prices
            if (
                !bookmaker ||
                bookmaker.data.staleOdds ||
                bookmaker.data.suspended ||
                !bookmaker.data.hasOdds
            ) {
                continue;
            }

            let bookmakerOdds = fixtureOdds.get(bookmakerName);

            // create bookmaker odds storage only when odds are received
            if (!bookmakerOdds) {
                bookmakerOdds = new Map();
                fixtureOdds.set(bookmakerName, bookmakerOdds);
            }

            for (const [oddsId, odd] of Object.entries(odds)) {
                const existing = bookmakerOdds.get(oddsId);

                // ignore odds updates that cannot move the current market state forward
                if (existing && existing.data.changedAt >= odd.changedAt) {
                    continue;
                }

                // remove odds because inactive markets should not remain exposed
                if (!odd.active || odd.marketActive === false) {
                    bookmakerOdds.delete(oddsId);
                    continue;
                }

                bookmakerOdds.set(oddsId, {
                    ts,
                    data: odd,
                });
            }

            // remove bookmaker container when it no longer contains active odds
            if (bookmakerOdds.size === 0) {
                fixtureOdds.delete(bookmakerName);
            }
        }

        // remove fixture odds when no bookmakers contain active markets
        if (fixtureOdds.size === 0) {
            this.odds.delete(payload.fixtureId);
        }

        // advance cursor after odds state has been accepted
        this.updateEpoch("odds", entryId);
    }

    applySnapshot(snapshot: Fixture[]) {
        const ts = Date.now();

        const snapshotFixtureIds = new Set(
            snapshot.map((fixture) => fixture.fixtureId),
        );

        for (const fixture of snapshot) {
            // snapshot replaces existing fixture state because it is the current source of truth
            this.fixtures.set(fixture.fixtureId, {
                ts,
                data: fixture,
            });

            let fixtureBookmakers = this.bookmakers.get(fixture.fixtureId);

            // create bookmaker storage because snapshot data may contain bookmaker state
            if (!fixtureBookmakers) {
                fixtureBookmakers = new Map();
                this.bookmakers.set(fixture.fixtureId, fixtureBookmakers);
            }

            if (fixture.bookmakers) {
                const snapshotBookmakers = new Set(
                    Object.keys(fixture.bookmakers),
                );

                for (const [bookmakerName, bookmaker] of Object.entries(
                    fixture.bookmakers,
                )) {
                    // replace bookmaker state because snapshot represents the latest complete view
                    fixtureBookmakers.set(bookmakerName, {
                        ts,
                        data: {
                            bookmaker: bookmakerName,
                            hasOdds: bookmaker.hasOdds ?? false,
                            staleOdds: bookmaker.staleOdds ?? false,
                            suspended: bookmaker.suspended ?? false,
                            participantsRotated:
                                bookmaker.participantsRotated ?? false,
                            bookmakerFixtureId: bookmaker.bookmakerFixtureId,
                            fixturePath: bookmaker.fixturePath,
                            updatedAt: null,
                            staleOddsResponseCode: null,
                            meta: null,
                        },
                    });

                    // remove odds because snapshot bookmaker state invalidates previous prices
                    if (
                        bookmaker.staleOdds ||
                        bookmaker.suspended ||
                        !bookmaker.hasOdds
                    ) {
                        this.odds.get(fixture.fixtureId)?.delete(bookmakerName);
                    }
                }

                for (const bookmakerName of fixtureBookmakers.keys()) {
                    // remove bookmakers because snapshot no longer contains them
                    if (!snapshotBookmakers.has(bookmakerName)) {
                        fixtureBookmakers.delete(bookmakerName);
                        this.odds.get(fixture.fixtureId)?.delete(bookmakerName);
                    }
                }

                // remove empty bookmaker collections to keep state compact
                if (fixtureBookmakers.size === 0) {
                    this.bookmakers.delete(fixture.fixtureId);
                }

                const fixtureOdds = this.odds.get(fixture.fixtureId);

                // remove empty odds collections to keep state compact
                if (fixtureOdds?.size === 0) {
                    this.odds.delete(fixture.fixtureId);
                }
            }
        }

        for (const fixtureId of this.fixtures.keys()) {
            // remove fixtures because snapshot is authoritative and they no longer exist
            if (!snapshotFixtureIds.has(fixtureId)) {
                this.fixtures.delete(fixtureId);
                this.bookmakers.delete(fixtureId);
                this.odds.delete(fixtureId);
            }
        }

        console.log("snapshot applied");
    }

    getState() {
        return {
            fixtures: Object.fromEntries(
                [...this.fixtures.entries()].map(([fixtureId, fixture]) => [
                    fixtureId,
                    fixture.data,
                ]),
            ),

            bookmakers: Object.fromEntries(
                [...this.bookmakers.entries()].map(
                    ([fixtureId, bookmakers]) => [
                        fixtureId,
                        Object.fromEntries(
                            [...bookmakers.entries()].map(
                                ([bookmakerName, bookmaker]) => [
                                    bookmakerName,
                                    bookmaker.data,
                                ],
                            ),
                        ),
                    ],
                ),
            ),

            odds: Object.fromEntries(
                [...this.odds.entries()].map(([fixtureId, bookmakers]) => [
                    fixtureId,
                    Object.fromEntries(
                        [...bookmakers.entries()].map(
                            ([bookmakerName, odds]) => [
                                bookmakerName,
                                Object.fromEntries(
                                    [...odds.entries()].map(([oddsId, odd]) => [
                                        oddsId,
                                        odd.data,
                                    ]),
                                ),
                            ],
                        ),
                    ),
                ]),
            ),
        };
    }
}
