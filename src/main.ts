import "dotenv/config";
import { OddspapiRestClient, OddspapiWsClient } from "./api/index.js";
import type { MessageEnvelope } from "./schemas/index.js";
import { State } from "./state.js";

async function main() {
    const state = new State();
    const restClient = new OddspapiRestClient();

    /*     try {
        console.log("bootstrapping state via HTTP...");
        const [bookmakerData, fixtureData, oddsData] = await Promise.all([
            restClient.getBookmakers(),
            restClient.getFixtures(),
            restClient.getOdds(),
        ]);

        state.applyBookmakers(bookmakerData);
        state.applyFixture(fixtureData);
        state.applyOdds(oddsData);
    } catch (err) {
        console.error("failed to fetch initial data", err);
    } */

    new OddspapiWsClient((msg: MessageEnvelope) => {
        const { channel, payload, ts } = msg;
        switch (channel) {
            case "bookmakers":
                state.applyBookmakers(payload, ts);
                break;
            case "fixtures":
                state.applyFixture(payload, ts);
                break;
            case "odds":
                state.applyOdds(payload, ts);
                break;
        }
    });
}

main();
