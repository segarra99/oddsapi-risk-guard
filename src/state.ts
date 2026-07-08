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
        if (serverEpoch) this.epoch.serverEpoch = serverEpoch;
        this.epoch.lastSeenId[channel] = entryId;
    }

    applyFixture(payload: Fixture, ts: number, entryId: string) {
        const existing = this.fixtures.get(payload.fixtureId);

        if (existing && existing.ts >= ts) {
            return;
        }

        this.fixtures.set(payload.fixtureId, {
            ts,
            data: payload,
        });

        this.updateEpoch("fixtures", entryId);
    }

    applyBookmakers(payload: BookmakersPayload, ts: number, entryId: string) {
        if (!this.fixtures.has(payload.fixtureId)) {
            return;
        }

        let fixtureBookmakers = this.bookmakers.get(payload.fixtureId);

        if (!fixtureBookmakers) {
            fixtureBookmakers = new Map();
            this.bookmakers.set(payload.fixtureId, fixtureBookmakers);
        }

        for (const bookmaker of Object.values(payload.bookmakers)) {
            const existing = fixtureBookmakers.get(bookmaker.bookmaker);

            if (existing && existing.ts >= ts) {
                continue;
            }

            fixtureBookmakers.set(bookmaker.bookmaker, {
                ts,
                data: bookmaker,
            });

            if (
                bookmaker.staleOdds ||
                bookmaker.suspended ||
                !bookmaker.hasOdds
            ) {
                this.odds.get(payload.fixtureId)?.delete(bookmaker.bookmaker);
            }
        }
        this.updateEpoch("bookmakers", entryId);
    }

    applyOdds(payload: OddsPayload, ts: number, entryId: string) {
        if (!this.fixtures.has(payload.fixtureId)) {
            return;
        }

        const fixtureBookmakers = this.bookmakers.get(payload.fixtureId);

        if (!fixtureBookmakers) {
            return;
        }

        let fixtureOdds = this.odds.get(payload.fixtureId);

        if (!fixtureOdds) {
            fixtureOdds = new Map();
            this.odds.set(payload.fixtureId, fixtureOdds);
        }

        for (const [bookmakerName, odds] of Object.entries(payload.odds)) {
            const bookmaker = fixtureBookmakers.get(bookmakerName);

            if (
                !bookmaker ||
                bookmaker.data.staleOdds ||
                bookmaker.data.suspended ||
                !bookmaker.data.hasOdds
            ) {
                continue;
            }

            let bookmakerOdds = fixtureOdds.get(bookmakerName);

            if (!bookmakerOdds) {
                bookmakerOdds = new Map();
                fixtureOdds.set(bookmakerName, bookmakerOdds);
            }

            for (const [oddsId, odd] of Object.entries(odds)) {
                const existing = bookmakerOdds.get(oddsId);

                if (existing && existing.data.changedAt >= odd.changedAt) {
                    continue;
                }

                if (!odd.active || odd.marketActive === false) {
                    bookmakerOdds.delete(oddsId);
                    continue;
                }

                bookmakerOdds.set(oddsId, {
                    ts,
                    data: odd,
                });
            }

            if (bookmakerOdds.size === 0) {
                fixtureOdds.delete(bookmakerName);
            }
        }

        if (fixtureOdds.size === 0) {
            this.odds.delete(payload.fixtureId);
        }

        this.updateEpoch("odds", entryId);
    }

    applySnapshot(snapshot: Fixture[]) {
        const ts = Date.now();

        const snapshotFixtureIds = new Set(
            snapshot.map((fixture) => fixture.fixtureId),
        );

        for (const fixture of snapshot) {
            this.fixtures.set(fixture.fixtureId, {
                ts,
                data: fixture,
            });

            let fixtureBookmakers = this.bookmakers.get(fixture.fixtureId);

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

                    if (
                        bookmaker.staleOdds ||
                        bookmaker.suspended ||
                        !bookmaker.hasOdds
                    ) {
                        this.odds.get(fixture.fixtureId)?.delete(bookmakerName);
                    }
                }

                for (const bookmakerName of fixtureBookmakers.keys()) {
                    if (!snapshotBookmakers.has(bookmakerName)) {
                        fixtureBookmakers.delete(bookmakerName);
                        this.odds.get(fixture.fixtureId)?.delete(bookmakerName);
                    }
                }

                if (fixtureBookmakers.size === 0) {
                    this.bookmakers.delete(fixture.fixtureId);
                }

                const fixtureOdds = this.odds.get(fixture.fixtureId);

                if (fixtureOdds?.size === 0) {
                    this.odds.delete(fixture.fixtureId);
                }
            }
        }

        for (const fixtureId of this.fixtures.keys()) {
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
