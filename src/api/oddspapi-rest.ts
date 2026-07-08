import {
    BookmakerSchema,
    FixtureSchema,
    OddsPayloadSchema,
} from "../schemas/index.js";
import {
    RestBookmakersResponseSchema,
    RestFixtureResponseSchema,
    RestFixtureSchema,
} from "../schemas/snapshot.js";

export class OddspapiRestClient {
    private readonly apiKey: string;
    private readonly baseUrl: string;

    constructor() {
        const apiKey = process.env.ODDSPAPI_API_KEY;
        if (!apiKey) {
            throw new Error("ODDSPAPI_API_KEY environment variable is not set");
        }

        const baseUrl = process.env.ODDSPAPI_BASE_URL;
        if (!baseUrl) {
            throw new Error(
                "ODDSPAPI_BASE_URL environment variable is not set",
            );
        }

        this.apiKey = apiKey;
        this.baseUrl = `https://${baseUrl}/en`;
    }

    async getBookmakers() {
        const res = await fetch(
            `${this.baseUrl}/bookmakers?apiKey=${this.apiKey}`,
        );

        if (!res.ok) {
            throw new Error(
                `failed to fetch bookmakers: ${res.status} ${res.statusText}`,
            );
        }

        const payload = await res.json();

        return RestBookmakersResponseSchema.parse(payload);
    }

    async getFixtures() {
        const sports = [10, 11, 12];

        const responses = await Promise.all(
            sports.map((sportId) =>
                fetch(
                    `${this.baseUrl}/fixtures?apiKey=${this.apiKey}&sportId=${sportId}`,
                ),
            ),
        );

        for (const res of responses) {
            if (!res.ok) {
                throw new Error(
                    `failed to fetch fixtures: ${res.status} ${res.statusText}`,
                );
            }
        }

        const payloads = await Promise.all(responses.map((res) => res.json()));

        return payloads.flatMap((payload) =>
            RestFixtureSchema.array().parse(payload),
        );
    }

    async getSnapshot() {
        const [bookmakers, fixtures] = await Promise.all([
            this.getBookmakers(),
            this.getFixtures(),
        ]);

        return {
            bookmakers,
            fixtures,
        };
    }
}
