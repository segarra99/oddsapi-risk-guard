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
                marketActive: z.boolean().nullish(),
                mainLine: z.boolean().nullish(),
                marketId: z.number(),
                bookmakerMarketId: z.string().nullish(),
                bookmakerOutcomeId: z.string().nullish(),
                bookmakerChangedAt: z.number().nullish(),
                priceFractional: z.string().nullish(),
                priceAmerican: z.number().nullish(),
                limit: z.number().nullish(),
                betslip: z.string().nullish(),
                meta: z.any().nullish(),
                changedAt: z.number(),
            }),
        ),
    ),
});

export type Odds = z.infer<typeof OddsSchema>;
