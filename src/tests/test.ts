import bookmaker from "./bookmaker.json" with { type: "json" };
import fixture from "./fixture.json" with { type: "json" };
import validOdds from "./odds.json" with { type: "json" };
import invalidOdds from "./bad-odds.json" with { type: "json" };
import type { MessageEnvelope } from "../schemas/index.js";
import { State } from "../state.js";

function runScenario(
    name: string,
    oddsMessage: MessageEnvelope,
    expectedAccepted: boolean,
) {
    const state = new State();

    const handleMessage = (msg: MessageEnvelope) => {
        switch (msg.channel) {
            case "fixtures":
                state.applyFixture(msg.payload, msg.ts, msg.entryId);
                break;

            case "bookmakers":
                state.applyBookmakers(msg.payload, msg.ts, msg.entryId);
                break;

            case "odds":
                state.applyOdds(msg.payload, msg.ts, msg.entryId);
                break;
        }
    };

    handleMessage(fixture as MessageEnvelope);
    handleMessage(bookmaker as MessageEnvelope);
    handleMessage(oddsMessage);

    const accepted = Object.keys(state.getState().odds).length > 0;

    if (accepted === expectedAccepted) {
        console.log(`PASS - ${name}`);
    } else {
        console.log(`FAIL - ${name}`);
    }
}

runScenario("valid odds update accepted", validOdds as MessageEnvelope, true);

runScenario(
    "invalid odds update rejected",
    invalidOdds as MessageEnvelope,
    false,
);
