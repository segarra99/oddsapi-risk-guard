import WebSocket from "ws";
import {
    MessageEnvelopeSchema,
    type MessageEnvelope,
} from "../schemas/index.js";
import type { WsEvent, Epoch } from "../types/index.js";

export class OddspapiWsClient {
    private ws: WebSocket | null = null;
    private baseUrl: string;
    private apiKey: string;
    private onMessage: (msg: MessageEnvelope) => void;
    private onEvent: (event: WsEvent) => void;

    constructor(
        onMessage: (msg: MessageEnvelope) => void,
        onEvent: (event: WsEvent) => void,
    ) {
        this.onMessage = onMessage;
        this.onEvent = onEvent;

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
            const authMessage = JSON.stringify({
                type: "login",
                apiKey: this.apiKey,
                receiveType: "json",
                channels: ["bookmakers", "fixtures", "odds"],
                sportIds: [10, 11, 12],
            });

            console.log("connected");
            this.ws!.send(authMessage);
        });

        this.ws.on("message", (data) => {
            try {
                const json = JSON.parse(data.toString());
                const parsed = MessageEnvelopeSchema.safeParse(json);

                if (parsed.success) {
                    this.onMessage(parsed.data);
                } else {
                    switch (json.type) {
                        case "login_ok":
                            this.onEvent({
                                type: "login_ok",
                                payload: {
                                    epoch: json.resume.serverEpoch,
                                    entryIds: json.resume.serverEntryIds,
                                },
                            });
                            break;
                        case "snapshot_required":
                            this.onEvent({ type: "snapshot_required" });
                            break;
                        case "reconnect":
                            this.onEvent({ type: "reconnect" });
                            break;
                        default:
                            console.error(parsed.error);
                            console.log("received unknown message", json);
                            break;
                    }
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

    reconnect(epoch?: Epoch): void {
        if (this.ws) {
            this.ws.close();
        }

        console.log("reconnecting...");
        this.connect();

        const authMessage = JSON.stringify({
            type: "login",
            apiKey: this.apiKey,
            receiveType: "json",
            channels: ["bookmakers", "fixtures", "odds"],
            sportIds: [10, 11, 12],
            serverEpoch: epoch?.serverEpoch,
            lastSeenId: epoch?.lastSeenId,
        });
        this.ws!.send(authMessage);
    }

    private close(): void {
        if (this.ws) {
            this.ws.close();
        }
    }
}
