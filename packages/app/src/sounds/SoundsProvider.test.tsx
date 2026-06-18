import { Audio } from 'expo-av';
import type { ReactNode } from 'react';
import * as Haptics from 'expo-haptics';
import { act, renderHook, waitFor } from '@testing-library/react-native';

import { SoundsProvider, useSoundEffects } from './SoundsProvider';
import { clearCreatedSounds, getCreatedSounds } from '../../__mocks__/expo-av';

const wrapper = ({ children }: { children: ReactNode }) => <SoundsProvider>{children}</SoundsProvider>;

beforeEach(() => {
    jest.clearAllMocks();
    clearCreatedSounds();
});

const waitForSoundsLoaded = () =>
    waitFor(() => {
        expect(Audio.Sound.createAsync).toHaveBeenCalledTimes(5);
    });

const getMockSound = (index: number) => {
    const sound = getCreatedSounds()[index];
    if (sound === undefined) throw new Error(`sound[${index}] was not created`);

    return sound;
};

describe('SoundsProvider', () => {
    it('loads all 5 sounds on mount', async () => {
        renderHook(() => useSoundEffects(), { wrapper });
        await waitForSoundsLoaded();
        expect(Audio.Sound.createAsync).toHaveBeenCalledTimes(5);
    });

    it('unloads all sounds on unmount', async () => {
        const { unmount } = renderHook(() => useSoundEffects(), { wrapper });
        await waitForSoundsLoaded();
        const sounds = getCreatedSounds();
        unmount();

        for (const sound of sounds) {
            expect(sound.unloadAsync).toHaveBeenCalled();
        }
    });
});

describe('useSoundEffects', () => {
    const setup = async () => {
        const hook = renderHook(() => useSoundEffects(), { wrapper });
        await waitForSoundsLoaded();

        return hook.result.current;
    };

    it('deal() calls replayAsync on the deal sound', async () => {
        const effects = await setup();
        await act(() => {
            effects.deal();
        });
        expect(getMockSound(0).replayAsync).toHaveBeenCalled();
    });

    it('flip() calls replayAsync on the flip sound', async () => {
        const effects = await setup();
        await act(() => {
            effects.flip();
        });
        expect(getMockSound(1).replayAsync).toHaveBeenCalled();
    });

    it('chip() calls replayAsync on the chip sound', async () => {
        const effects = await setup();
        await act(() => {
            effects.chip();
        });
        expect(getMockSound(2).replayAsync).toHaveBeenCalled();
    });

    it('win() calls replayAsync on the win sound', async () => {
        const effects = await setup();
        await act(() => {
            effects.win();
        });
        expect(getMockSound(3).replayAsync).toHaveBeenCalled();
    });

    it('bust() calls replayAsync on the bust sound', async () => {
        const effects = await setup();
        await act(() => {
            effects.bust();
        });
        expect(getMockSound(4).replayAsync).toHaveBeenCalled();
    });

    it('deal() triggers a Light impact haptic', async () => {
        const effects = await setup();
        await act(() => {
            effects.deal();
        });
        expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
    });

    it('win() triggers a Success notification haptic', async () => {
        const effects = await setup();
        await act(() => {
            effects.win();
        });
        expect(Haptics.notificationAsync).toHaveBeenCalledWith(Haptics.NotificationFeedbackType.Success);
    });

    it('bust() triggers an Error notification haptic', async () => {
        const effects = await setup();
        await act(() => {
            effects.bust();
        });
        expect(Haptics.notificationAsync).toHaveBeenCalledWith(Haptics.NotificationFeedbackType.Error);
    });
});
