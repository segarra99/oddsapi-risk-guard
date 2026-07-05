import { z } from "zod";

export const MessageEnvelopeSchema = z.object({
    channel: z.enum(["bookmakers", "fixtures", "odds", "scores"]),
    type: z.literal("UPDATE"),
    payload: z.unknown(),
    ts: z.number(),
    entryId: z.string(),
});

export type MessageEnvelope = z.infer<typeof MessageEnvelopeSchema>;
export type Channel = z.infer<typeof MessageEnvelopeSchema>["channel"];
