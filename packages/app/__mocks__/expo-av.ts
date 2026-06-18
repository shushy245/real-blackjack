const makeMockSound = () => ({
    replayAsync: jest.fn().mockResolvedValue(undefined),
    unloadAsync: jest.fn().mockResolvedValue(undefined),
});

export const Audio = {
    setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
    Sound: {
        createAsync: jest.fn().mockImplementation(() => Promise.resolve({ sound: makeMockSound(), status: {} })),
    },
};
