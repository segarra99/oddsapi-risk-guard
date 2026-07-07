import { z } from "zod";

export const BookmakerSchema = z.object({
    bookmaker: z.string(),
    bookmakerFixtureId: z.string().nullish(),
    fixturePath: z.string().nullish(),
    hasOdds: z.boolean(),
    staleOdds: z.boolean(),
    staleOddsResponseCode: z.number().nullish(),
    suspended: z.boolean(),
    participantsRotated: z.boolean(),
    meta: z.any().nullish(),
    updatedAt: z.string(),
});

export const BookmakersPayloadSchema = z.object({
    fixtureId: z.string(),
    bookmakers: z.record(z.string(), BookmakerSchema),
});

export type Bookmaker = z.infer<typeof BookmakerSchema>;
export type BookmakersPayload = z.infer<typeof BookmakersPayloadSchema>;
