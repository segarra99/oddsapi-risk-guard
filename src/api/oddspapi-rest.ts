import {
    MessageEnvelopeSchema,
    type BookmakersPayload,
    type Fixture,
    type MessageEnvelope,
    type OddsPayload,
} from "../schemas/index.js";

export class OddspapiRestClient {
    private readonly apiKey: string;
    private readonly baseUrl: string;

    constructor() {
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

        this.baseUrl = `https://${baseUrl}/en`;
        this.apiKey = apiKey;
    }

    async getBookmakers(): Promise<BookmakersPayload> {
        const url = `${this.baseUrl}/bookmakers?apiKey=${this.apiKey}`;
        const res = await fetch(url);
        console.log(res.status, res.statusText);
        console.log(await res.text());

        if (!res.ok)
            throw new Error(
                `Oddspapi HTTP error: ${res.status} ${res.statusText}`,
            );

        const data = await res.json();
        return MessageEnvelopeSchema.parse(data);
    }

    async getFixtures(): Promise<Fixture> {
        const url = `${this.baseUrl}/fixtures/today?apiKey=${this.apiKey}`;
        const res = await fetch(url);
        console.log(res.status, res.statusText);
        console.log(await res.text());

        if (!res.ok)
            throw new Error(
                `Oddspapi HTTP error: ${res.status} ${res.statusText}`,
            );

        const data = await res.json();
        return MessageEnvelopeSchema.parse(data);
    }

    async getOdds(): Promise<OddsPayload> {
        const url = `${this.baseUrl}/odds?apiKey=${this.apiKey}`;
        const res = await fetch(url);

        if (!res.ok)
            throw new Error(
                `Oddspapi HTTP error: ${res.status} ${res.statusText}`,
            );

        const data = await res.json();
        return MessageEnvelopeSchema.parse(data);
    }
}
