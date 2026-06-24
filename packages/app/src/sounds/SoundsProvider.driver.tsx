import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import type { JSX, ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';

import { getCreatedSounds } from '../../__mocks__/expo-av';
import { SoundsProvider, useSoundEffects } from './SoundsProvider';

const wrapper = ({ children }: { children: ReactNode }): JSX.Element => <SoundsProvider>{children}</SoundsProvider>;

type SoundsSetup = {
    effects: ReturnType<typeof useSoundEffects>;
    unmount: () => void;
};

type SoundsProviderDriver = {
    when: {
        setup: () => Promise<SoundsSetup>;
    };
    assert: {
        soundCreatedCount: (count: number) => void;
        allSoundsUnloaded: () => void;
        dealSoundReplayed: () => void;
        dealSoundReplayedTimes: (count: number) => void;
        flipSoundReplayed: () => void;
        chipSoundReplayed: () => void;
        winSoundReplayed: () => void;
        bustSoundReplayed: () => void;
        dealHapticTriggered: () => void;
        winHapticTriggered: () => void;
        bustHapticTriggered: () => void;
    };
};

const getSoundAt = (index: number) => {
    const sound = getCreatedSounds()[index];
    if (sound === undefined) throw new Error(`SoundsProviderDriver: sound[${index}] was not created`);

    return sound;
};

export const makeSoundsProviderDriver = (): SoundsProviderDriver => ({
    when: {
        setup: async (): Promise<SoundsSetup> => {
            const { result, unmount } = renderHook(() => useSoundEffects(), { wrapper });
            await waitFor(() => {
                expect(Audio.Sound.createAsync).toHaveBeenCalledTimes(5);
            });

            return { effects: result.current, unmount };
        },
    },
    assert: {
        soundCreatedCount: (count): void => {
            expect(Audio.Sound.createAsync).toHaveBeenCalledTimes(count);
        },
        allSoundsUnloaded: (): void => {
            for (const sound of getCreatedSounds()) {
                expect(sound.unloadAsync).toHaveBeenCalled();
            }
        },
        dealSoundReplayed: (): void => {
            expect(getSoundAt(0).replayAsync).toHaveBeenCalled();
        },
        dealSoundReplayedTimes: (count): void => {
            expect(getSoundAt(0).replayAsync).toHaveBeenCalledTimes(count);
        },
        flipSoundReplayed: (): void => {
            expect(getSoundAt(1).replayAsync).toHaveBeenCalled();
        },
        chipSoundReplayed: (): void => {
            expect(getSoundAt(2).replayAsync).toHaveBeenCalled();
        },
        winSoundReplayed: (): void => {
            expect(getSoundAt(3).replayAsync).toHaveBeenCalled();
        },
        bustSoundReplayed: (): void => {
            expect(getSoundAt(4).replayAsync).toHaveBeenCalled();
        },
        dealHapticTriggered: (): void => {
            expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
        },
        winHapticTriggered: (): void => {
            expect(Haptics.notificationAsync).toHaveBeenCalledWith(Haptics.NotificationFeedbackType.Success);
        },
        bustHapticTriggered: (): void => {
            expect(Haptics.notificationAsync).toHaveBeenCalledWith(Haptics.NotificationFeedbackType.Error);
        },
    },
});
