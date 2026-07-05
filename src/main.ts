import "dotenv/config";
import { connectFeed } from "./websocket.js";
import type { MessageEnvelope } from "./schemas/index.js";

function main() {
    connectFeed((message: MessageEnvelope) => {
        switch (message.channel) {
            case "bookmakers":
                // Handle bookmakers message
                break;
            case "fixtures":
                // Handle fixtures message
                break;
            case "odds":
                // Handle odds message
                break;
            default:
                console.warn("unknown channel:", message.channel);
        }
        //console.log(result.ok ? "ACCEPT" : "REJECT");
    });
}

main();
