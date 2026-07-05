import { z } from "zod";

export const BookmakerSchema = z.object({
    fixtureId: z.string(),
    bookmakers: z.record(
        z.string(),
        z.object({
            bookmaker: z.string(),
            bookmakerFixtureId: z.string().nullable(),
            fixturePath: z.string().nullable(),
            hasOdds: z.boolean(),
            staleOdds: z.boolean(),
            staleOddsResponseCode: z.number().nullable(),
            suspended: z.boolean(),
            participantsRotated: z.boolean(),
            meta: z.any().nullable(),
            updatedAt: z.string(),
        }),
    ),
});

export type Bookmaker = z.infer<typeof BookmakerSchema>;
