import WebSocket from "ws";
import {
    MessageEnvelopeSchema,
    type MessageEnvelope,
} from "../schemas/index.js";

export class OddspapiWsClient {
    private ws: WebSocket | null = null;
    private baseUrl: string;
    private apiKey: string;
    private onMessage: (msg: MessageEnvelope) => void;

    constructor(onMessage: (msg: MessageEnvelope) => void) {
        this.onMessage = onMessage;

        const baseUrl = process.env.ODDSPAPI_BASE_URL;
        if (!baseUrl) {
            throw new Error(
                "ODDSPAPI_BASE_URL environment variable is not set",
            );
        }

        const apiKey = process.env.ODDSPAPI_API_KEY;
        if (!apiKey) {
            throw new Error("ODDSPAPI_API_KEY environment variable is not set");
        }

        this.baseUrl = `wss://${baseUrl}/ws`;
        this.apiKey = apiKey;

        this.connect();
    }

    private connect(): void {
        this.ws = new WebSocket(this.baseUrl);

        this.ws.on("open", () => {
            this.ws!.send(
                JSON.stringify({
                    type: "login",
                    apiKey: this.apiKey,
                    receiveType: "json",
                    channels: ["bookmakers", "fixtures", "odds"],
                    sportIds: [10, 11, 12],
                }),
            );
            console.log("connected");
        });

        this.ws.on("message", (data) => {
            try {
                const json = JSON.parse(data.toString());
                const parsed = MessageEnvelopeSchema.safeParse(json);

                if (parsed.success) {
                    this.onMessage(parsed.data);
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

        this.ws.on("error", (err) => {
            console.error("web socket error", err);
        });

        this.ws.on("close", () => {
            console.log("disconnected");
        });
    }

    private reconnect(): void {
        if (this.ws) {
            this.ws.close();
        }
        console.log("reconnecting...");
        this.connect();
    }

    private close(): void {
        if (this.ws) {
            this.ws.close();
        }
    }
}
