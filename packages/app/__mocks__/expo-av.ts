export type MockSound = { replayAsync: jest.Mock; unloadAsync: jest.Mock };

const createdSounds: MockSound[] = [];

export const getCreatedSounds = (): MockSound[] => createdSounds;

export const clearCreatedSounds = (): void => {
    createdSounds.length = 0;
};

const makeMockSound = (): MockSound => ({
    replayAsync: jest.fn().mockResolvedValue(undefined),
    unloadAsync: jest.fn().mockResolvedValue(undefined),
});

export const Audio = {
    setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
    Sound: {
        createAsync: jest.fn().mockImplementation(() => {
            const sound = makeMockSound();
            createdSounds.push(sound);

            return Promise.resolve({ sound, status: {} });
        }),
    },
};
