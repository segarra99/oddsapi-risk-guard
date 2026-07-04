import WebSocket from "ws";

export function connectFeed(onMessage: (data: any) => void) {
    const wsUrl = process.env.ODDS_WS_URL;
    const apiKey = process.env.ODDS_API_KEY;
    if (!wsUrl) {
        throw new Error("ODDS_WS_URL environment variable is not set");
    }
    if (!apiKey) {
        throw new Error("ODDS_API_KEY environment variable is not set");
    }

    const ws = new WebSocket(wsUrl);

    ws.on("open", () => {
        ws.send(JSON.stringify({ type: "login", apiKey: apiKey }));
        console.log("connected");
    });

    ws.on("message", (data) => {
        try {
            const msg = JSON.parse(data.toString());
            onMessage(msg);
        } catch (err) {
            console.error("failed to parse message", err);
        }
    });

    ws.on("error", (err) => {
        console.error("ws error", err);
    });

    ws.on("close", () => {
        console.log("disconnected");
    });
}
