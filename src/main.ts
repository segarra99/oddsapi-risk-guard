import "dotenv/config";
import { OddspapiRestClient, OddspapiWsClient } from "./api/index.js";
import type { MessageEnvelope } from "./schemas/index.js";
import { State } from "./state.js";

async function main() {
    const state = new State();
    const restClient = new OddspapiRestClient();

    try {
        console.log("bootstrapping state via HTTP...");
        const snapshot = await restClient.getSnapshot();
        state.applySnapshot(snapshot);
    } catch (err) {
        console.error("failed to fetch initial data", err);
    }

    const wsClient = new OddspapiWsClient(
        (msg: MessageEnvelope) => {
            const { channel, payload, ts, entryId } = msg;

            switch (channel) {
                case "bookmakers":
                    state.applyBookmakers(payload, ts, entryId);
                    break;
                case "fixtures":
                    state.applyFixture(payload, ts, entryId);
                    break;
                case "odds":
                    state.applyOdds(payload, ts, entryId);
                    break;
            }
        },
        async (event) => {
            switch (event.type) {
                case "login_ok":
                    console.log("websocket authenticated");
                    const serverEpoch = event.payload.epoch;
                    const serverEntryIds = event.payload.entryIds;

                    for (const [channel, id] of Object.entries(
                        serverEntryIds,
                    )) {
                        state.updateEpoch(channel, id as string, serverEpoch);
                    }
                    break;
                case "reconnect":
                    console.log("reconnect message received");
                    const epoch = state.getEpoch();
                    wsClient.reconnect(epoch);
                    break;
                case "snapshot_required":
                    console.log("fetching new snapshot...");
                    try {
                        const snapshot = await restClient.getSnapshot();
                        state.applySnapshot(snapshot);
                    } catch (err) {
                        console.error("failed to refresh snapshot", err);
                    }
                    break;
            }
        },
    );
}

main();
