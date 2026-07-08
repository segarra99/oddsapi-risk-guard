import { z } from "zod";

export const FixtureSchema = z.object({
    fixtureId: z.string(),
    status: z.object({
        live: z.boolean(),
        statusId: z.number().nullish(),
        statusName: z.string().nullish(),
    }),
    sport: z.object({
        sportId: z.number(),
        sportName: z.string(),
    }),
    tournament: z.object({
        tournamentId: z.number(),
        tournamentName: z.string(),
        categoryName: z.string().nullish(),
    }),
    season: z.object({
        seasonId: z.number().nullish(),
        seasonName: z.string().nullish(),
        seasonRound: z.number().nullish(),
    }),
    venue: z
        .object({
            venueId: z.number().nullish(),
            venueName: z.string().nullish(),
            venueLocation: z.string().nullish(),
        })
        .nullish(),
    startTime: z.number(),
    trueStartTime: z.string().nullish(),
    trueEndTime: z.string().nullish(),
    participants: z.object({
        participant1Id: z.number(),
        participant1Name: z.string(),
        participant1ShortName: z.string().nullish(),
        participant1Abbr: z.string().nullish(),
        participant1RotNr: z.number().nullish(),
        participant2Id: z.number(),
        participant2Name: z.string(),
        participant2ShortName: z.string().nullish(),
        participant2Abbr: z.string().nullish(),
        participant2RotNr: z.number().nullish(),
    }),
    scores: z.record(z.string(), z.any()).nullish(),
    clock: z
        .object({
            currentPeriod: z.string().nullish(),
            currentTime: z.string().nullish(),
            remainingTime: z.string().nullish(),
            remainingTimeInPeriod: z.string().nullish(),
            stopped: z.boolean().nullish(),
        })
        .nullish(),
    expectedPeriods: z.number().nullish(),
    periodLength: z.number().nullish(),
    externalProviders: z.object({
        betgeniusId: z.number().nullish(),
        betradarId: z.number().nullish(),
        flashscoreId: z.string().nullish(),
        mollybetId: z.string().nullish(),
        oddinId: z.number().nullish(),
        opticoddsId: z.string().nullish(),
        pinnacleId: z.number().nullish(),
        sofascoreId: z.number().nullish(),
        lsportsId: z.number().nullish(),
        txoddsId: z.number().nullish(),
    }),
    bookmakers: z.record(z.string(), z.any()).nullish(),
});

export type Fixture = z.infer<typeof FixtureSchema>;
