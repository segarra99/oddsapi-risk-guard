import { z } from "zod";

export const RestBookmakerSchema = z.object({
    slug: z.string(),
    bookmakerName: z.string(),
    active: z.boolean(),
    domain: z.string().nullish(),
    serverGroup: z.string().nullish(),
    price: z.number().int().nullish(),
    websocketPregame: z.boolean().nullish(),
    websocketLive: z.boolean().nullish(),
    playerProps: z.boolean().nullish(),
    maxDelayPregameInSec: z.number().nullish(),
    maxDelayLiveInSec: z.number().nullish(),
    maxDelayPregameMainInSec: z.number().nullish(),
    availableCountries: z.array(z.string()).nullish(),
});

export const RestFixtureSchema = z.object({
    fixtureId: z.string(),
    status: z.object({
        live: z.boolean(),
        statusId: z.number().int().nullish(),
        statusName: z.string().nullish(),
    }),
    sport: z.object({
        sportId: z.number().int(),
        sportName: z.string(),
    }),
    tournament: z.object({
        tournamentId: z.number().int(),
        tournamentName: z.string(),
        categoryName: z.string().nullish(),
    }),
    season: z.object({
        seasonId: z.number().int().nullish(),
        seasonName: z.string().nullish(),
        seasonRound: z.number().nullish(),
    }),
    venue: z
        .object({
            venueId: z.number().int().nullish(),
            venueName: z.string().nullish(),
            venueLocation: z.string().nullish(),
        })
        .nullish(),
    startTime: z.number().int(),
    trueStartTime: z.string().nullish(),
    trueEndTime: z.string().nullish(),
    participants: z.object({
        participant1Id: z.number().int(),
        participant1RotNr: z.number().int().nullish(),
        participant1Name: z.string().nullish(),
        participant1ShortName: z.string().nullish(),
        participant1Abbr: z.string().nullish(),
        participant2Id: z.number().int(),
        participant2RotNr: z.number().int().nullish(),
        participant2Name: z.string(),
        participant2ShortName: z.string().nullish(),
        participant2Abbr: z.string().nullish(),
    }),
    scores: z
        .record(
            z.string(),
            z.object({
                period: z.string(),
                participant1Score: z.number(),
                participant2Score: z.number(),
                updatedAt: z.string().datetime({ offset: true }),
            }),
        )
        .nullish(),
    clock: z
        .object({
            currentPeriod: z.string().nullable(),
            currentTime: z.string().nullable(),
            remainingTime: z.string().nullable(),
            remainingTimeInPeriod: z.string().nullable(),
            stopped: z.boolean().nullable(),
        })
        .nullable(),
    expectedPeriods: z.number().int().nullable(),
    periodLength: z.number().int().nullable(),
    externalProviders: z.object({
        betgeniusId: z.number().int().nullable(),
        betradarId: z.number().int().nullable(),
        flashscoreId: z.string().nullable(),
        mollybetId: z.string().nullable(),
        oddinId: z.number().int().nullable(),
        opticoddsId: z.string().nullable(),
        pinnacleId: z.number().int().nullable(),
        sofascoreId: z.number().int().nullable(),
        lsportsId: z.number().int().nullable(),
        txoddsId: z.number().int().nullable(),
    }),
    bookmakers: z.record(
        z.string(),
        z.object({
            staleOdds: z.boolean().nullish(),
            suspended: z.boolean().nullish(),
            hasOdds: z.boolean().nullish(),
            participantsRotated: z.boolean().nullish(),
            bookmakerFixtureId: z.string().nullable(),
            fixturePath: z.string().nullable(),
        }),
    ),
});

export const RestFixtureResponseSchema = z.array(RestFixtureSchema);
export const RestBookmakersResponseSchema = z.array(RestBookmakerSchema);
export type RestFixture = z.infer<typeof RestFixtureSchema>;
export type RestFixtureResponse = z.infer<typeof RestFixtureResponseSchema>;
export type RestBookmaker = z.infer<typeof RestBookmakerSchema>;
export type RestBookmakersResponse = z.infer<
    typeof RestBookmakersResponseSchema
>;
