import type { Odds } from "../schemas/index.js";

export type Outcome = Odds["odds"][string][string];

export class OddsState {
    private storage = new Map<string, Outcome>();

    update(odds: Odds): void {
        const { fixtureId, odds: bookmakerOdds } = odds;

        for (const [bookmakerKey, outcomes] of Object.entries(bookmakerOdds)) {
            for (const [oddsId, outcome] of Object.entries(outcomes)) {
                this.storage.set(oddsId, outcome);
            }
        }
    }

    get(fixtureId: string, bookmaker: string, outcomeId: number, playerId: number): Outcome | undefined {
        const oddsId = `${fixtureId}:${bookmaker}:${outcomeId}:${playerId}`;
        return this.storage.get(oddsId);
    }
}
