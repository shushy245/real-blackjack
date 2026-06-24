import { act } from '@testing-library/react-native';

import { clearCreatedSounds } from '../../__mocks__/expo-av';
import { makeSoundsProviderDriver } from './SoundsProvider.driver';

let driver: ReturnType<typeof makeSoundsProviderDriver>;

beforeEach(() => {
    jest.clearAllMocks();
    clearCreatedSounds();
    driver = makeSoundsProviderDriver();
});

describe('SoundsProvider', () => {
    it('loads all 5 sounds on mount', async () => {
        await driver.when.setup();
        driver.assert.soundCreatedCount(5);
    });

    it('unloads all sounds on unmount', async () => {
        const { unmount } = await driver.when.setup();
        unmount();
        driver.assert.allSoundsUnloaded();
    });
});

describe('useSoundEffects', () => {
    it('deal() calls replayAsync on the deal sound', async () => {
        const { effects } = await driver.when.setup();
        await act(() => {
            effects.deal();
        });
        driver.assert.dealSoundReplayed();
    });

    it('deal() plays only once when called rapidly in succession', async () => {
        const { effects } = await driver.when.setup();
        await act(() => {
            effects.deal();
            effects.deal();
            effects.deal();
            effects.deal();
        });
        driver.assert.dealSoundReplayedTimes(1);
    });

    it('deal() plays again after the debounce window passes', async () => {
        const dateSpy = jest.spyOn(Date, 'now').mockReturnValue(0);
        const { effects } = await driver.when.setup();
        await act(() => {
            effects.deal();
        });
        dateSpy.mockReturnValue(201);
        await act(() => {
            effects.deal();
        });
        driver.assert.dealSoundReplayedTimes(2);
        dateSpy.mockRestore();
    });

    it('flip() calls replayAsync on the flip sound', async () => {
        const { effects } = await driver.when.setup();
        await act(() => {
            effects.flip();
        });
        driver.assert.flipSoundReplayed();
    });

    it('chip() calls replayAsync on the chip sound', async () => {
        const { effects } = await driver.when.setup();
        await act(() => {
            effects.chip();
        });
        driver.assert.chipSoundReplayed();
    });

    it('win() calls replayAsync on the win sound', async () => {
        const { effects } = await driver.when.setup();
        await act(() => {
            effects.win();
        });
        driver.assert.winSoundReplayed();
    });

    it('bust() calls replayAsync on the bust sound', async () => {
        const { effects } = await driver.when.setup();
        await act(() => {
            effects.bust();
        });
        driver.assert.bustSoundReplayed();
    });

    it('deal() triggers a Light impact haptic', async () => {
        const { effects } = await driver.when.setup();
        await act(() => {
            effects.deal();
        });
        driver.assert.dealHapticTriggered();
    });

    it('win() triggers a Success notification haptic', async () => {
        const { effects } = await driver.when.setup();
        await act(() => {
            effects.win();
        });
        driver.assert.winHapticTriggered();
    });

    it('bust() triggers an Error notification haptic', async () => {
        const { effects } = await driver.when.setup();
        await act(() => {
            effects.bust();
        });
        driver.assert.bustHapticTriggered();
    });
});
