import WebSocket from "ws";
import {
    MessageEnvelopeSchema,
    type MessageEnvelope,
} from "./schemas/index.js";

export function connectFeed(onMessage: (message: MessageEnvelope) => void) {
    const wsUrl = process.env.ODDS_WS_URL;
    if (!wsUrl) {
        throw new Error("ODDS_WS_URL environment variable is not set");
    }

    const apiKey = process.env.ODDS_API_KEY;
    if (!apiKey) {
        throw new Error("ODDS_API_KEY environment variable is not set");
    }

    const ws = new WebSocket(wsUrl);

    ws.on("open", () => {
        ws.send(
            JSON.stringify({
                type: "login",
                apiKey: apiKey,
                receiveType: "json",
                channels: ["bookmakers", "fixtures", "odds"],
                sportIds: [10, 11, 12],
                bookmakers: ["pinnacle", "betfair-ex", "circasports"],
            }),
        );
        console.log("connected");
    });

    ws.on("message", (data) => {
        try {
            const json = JSON.parse(data.toString());
            const parsed = MessageEnvelopeSchema.safeParse(json);

            if (parsed.success) {
                onMessage(parsed.data);
            } else {
                if (json.type === "login_ok") {
                    console.log("login successful");
                    return;
                }
                console.error(parsed.error);
                console.log("received non-channel message", json);
            }
        } catch (err) {
            console.error("received invalid JSON", err);
        }
    });

    ws.on("error", (err) => {
        console.error("web socket error", err);
    });

    ws.on("close", () => {
        console.log("disconnected");
    });
}
