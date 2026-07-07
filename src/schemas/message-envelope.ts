import { z } from "zod";
import { BookmakersPayloadSchema } from "./bookmaker.js";
import { FixtureSchema } from "./fixture.js";
import { OddsPayloadSchema } from "./odds.js";

const envelope = <
    const C extends "bookmakers" | "fixtures" | "odds",
    T extends z.ZodTypeAny,
>(
    channel: C,
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
    envelope("bookmakers", BookmakersPayloadSchema),
    envelope("fixtures", FixtureSchema),
    envelope("odds", OddsPayloadSchema),
]);

export type MessageEnvelope = z.infer<typeof MessageEnvelopeSchema>;
