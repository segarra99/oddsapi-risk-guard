import { z } from "zod";
import { ChannelSchema } from "./channel.js";

export const MessageEnvelopeSchema = z.object({
    channel: ChannelSchema,
    type: z.literal("UPDATE"),
    payload: z.unknown(),
    ts: z.number(),
    entryId: z.string(),
});

export type MessageEnvelope = z.infer<typeof MessageEnvelopeSchema>;
