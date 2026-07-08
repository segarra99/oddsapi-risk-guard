export type Epoch = {
    serverEpoch: string;
    lastSeenId: {
        [key: string]: string;
    };
};
