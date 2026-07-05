import { z } from "zod";
import { BookmakerSchema } from "./bookmakers.js";
import { FixtureSchema } from "./fixtures.js";
import { OddsSchema } from "./odds.js";

const envelope = <T extends z.ZodTypeAny>(
    channel: "bookmakers" | "fixtures" | "odds",
    payload: T,
) =>
    z.object({
        channel: z.literal(channel),
        type: z.literal("UPDATE"),
        payload,
        ts: z.number(),
        entryId: z.string(),
    });

export const MessageEnvelopeSchema = z.discriminatedUnion("channel", [
    envelope("bookmakers", BookmakerSchema),
    envelope("fixtures", FixtureSchema),
    envelope("odds", OddsSchema),
]);

export type MessageEnvelope = z.infer<typeof MessageEnvelopeSchema>;
