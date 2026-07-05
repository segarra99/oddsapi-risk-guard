import { z } from "zod";

export const ChannelSchema = z.enum([
    "bookmakers",
    "fixtures",
    "odds",
    "scores",
]);

export type Channel = z.infer<typeof ChannelSchema>;
