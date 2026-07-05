import { z } from "zod";

export const OddsSchema = z.object({
    fixtureId: z.string(),
    odds: z.record(
        z.string(),
        z.record(
            z.string(),
            z.object({
                bookmaker: z.string(),
                outcomeId: z.number(),
                playerId: z.number(),
                price: z.number(),
                active: z.boolean(),
                marketActive: z.boolean().nullable(),
                mainLine: z.boolean().nullable(),
                marketId: z.number(),
                bookmakerMarketId: z.string().nullable(),
                bookmakerOutcomeId: z.string().nullable(),
                bookmakerChangedAt: z.number().nullable(),
                priceFractional: z.string(),
                priceAmerican: z.number(),
                limit: z.number().nullable(),
                betslip: z.string().nullable(),
                meta: z.any().nullable(),
                changedAt: z.number(),
            }),
        ),
    ),
});

export type Odds = z.infer<typeof OddsSchema>;
