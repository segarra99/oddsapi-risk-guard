import { z } from "zod";

export const FixtureSchema = z.object({
    fixtureId: z.string(),
    status: z.object({
        live: z.boolean(),
        statusId: z.number().nullable(),
        statusName: z.string().nullable(),
    }),
    sport: z.object({
        sportId: z.number(),
        sportName: z.string(),
    }),
    tournament: z.object({
        tournamentId: z.number(),
        tournamentName: z.string(),
        categoryName: z.string(),
    }),
    season: z.object({
        seasonId: z.number().nullable(),
        seasonName: z.string().nullable(),
        seasonRound: z.number().nullable(),
    }),
    venue: z.object({
        venueId: z.number().nullable(),
        venueName: z.string().nullable(),
        venueLocation: z.string().nullable(),
    }),
    startTime: z.number(),
    trueStartTime: z.string().nullable(),
    trueEndTime: z.string().nullable(),
    participants: z.object({
        participant1Id: z.number(),
        participant1Name: z.string(),
        participant1ShortName: z.string().nullable(),
        participant1Abbr: z.string().nullable(),
        participant1RotNr: z.number().nullable(),
        participant2Id: z.number(),
        participant2Name: z.string(),
        participant2ShortName: z.string().nullable(),
        participant2Abbr: z.string().nullable(),
        participant2RotNr: z.number().nullable(),
    }),
    scores: z.record(z.string(), z.any()).optional(),
    clock: z
        .object({
            currentPeriod: z.string().nullable(),
            currentTime: z.string().nullable(),
            remainingTime: z.string().nullable(),
            remainingTimeInPeriod: z.string().nullable(),
            stopped: z.boolean().nullable(),
        })
        .nullable(),
    expectedPeriods: z.number().nullable(),
    periodLength: z.number().nullable(),
    externalProviders: z.object({
        betgeniusId: z.number().nullable(),
        betradarId: z.number().nullable(),
        flashscoreId: z.string().nullable(),
        mollybetId: z.string().nullable(),
        oddinId: z.number().nullable(),
        opticoddsId: z.string().nullable(),
        pinnacleId: z.number().nullable(),
        sofascoreId: z.number().nullable(),
        lsportsId: z.number().nullable(),
        txoddsId: z.number().nullable(),
    }),
    bookmakers: z.record(z.string(), z.any()),
});

export type Fixture = z.infer<typeof FixtureSchema>;
