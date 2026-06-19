import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import type { JSX, MutableRefObject, ReactNode } from 'react';
import { createContext, useContext, useEffect, useMemo, useRef } from 'react';

type SoundEffects = {
    deal: () => void;
    flip: () => void;
    chip: () => void;
    win: () => void;
    bust: () => void;
};

const noop = () => {};

const SoundsContext = createContext<SoundEffects>({
    deal: noop,
    flip: noop,
    chip: noop,
    win: noop,
    bust: noop,
});

/* eslint-disable @typescript-eslint/no-var-requires */
const WIN_ASSET = require('../../assets/sounds/win.wav');
const DEAL_ASSET = require('../../assets/sounds/deal.wav');
const FLIP_ASSET = require('../../assets/sounds/flip.wav');
const CHIP_ASSET = require('../../assets/sounds/chip.wav');
const BUST_ASSET = require('../../assets/sounds/bust.wav');
/* eslint-enable @typescript-eslint/no-var-requires */

const playRef = (ref: MutableRefObject<Audio.Sound | undefined>): void => {
    ref.current?.replayAsync().catch(() => {});
};

export const SoundsProvider = ({ children }: { children: ReactNode }): JSX.Element => {
    const dealRef = useRef<Audio.Sound | undefined>(undefined);
    const flipRef = useRef<Audio.Sound | undefined>(undefined);
    const chipRef = useRef<Audio.Sound | undefined>(undefined);
    const winRef = useRef<Audio.Sound | undefined>(undefined);
    const bustRef = useRef<Audio.Sound | undefined>(undefined);

    useEffect(() => {
        let cancelled = false;
        const allRefs = [dealRef, flipRef, chipRef, winRef, bustRef];

        const load = async (): Promise<void> => {
            await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
            const [deal, flip, chip, win, bust] = await Promise.all([
                Audio.Sound.createAsync(DEAL_ASSET),
                Audio.Sound.createAsync(FLIP_ASSET),
                Audio.Sound.createAsync(CHIP_ASSET),
                Audio.Sound.createAsync(WIN_ASSET),
                Audio.Sound.createAsync(BUST_ASSET),
            ]);
            if (cancelled) {
                [deal, flip, chip, win, bust].forEach(({ sound }) => {
                    sound.unloadAsync().catch(() => {});
                });

                return;
            }
            dealRef.current = deal.sound;
            flipRef.current = flip.sound;
            chipRef.current = chip.sound;
            winRef.current = win.sound;
            bustRef.current = bust.sound;
        };

        load().catch(() => {});

        return () => {
            cancelled = true;
            allRefs.forEach((ref) => {
                ref.current?.unloadAsync().catch(() => {});
            });
        };
    }, []);

    const value = useMemo<SoundEffects>(
        () => ({
            deal: () => {
                playRef(dealRef);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            },
            flip: () => playRef(flipRef),
            chip: () => playRef(chipRef),
            win: () => {
                playRef(winRef);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
            },
            bust: () => {
                playRef(bustRef);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
            },
        }),
        [],
    );

    return <SoundsContext.Provider value={value}>{children}</SoundsContext.Provider>;
};

export const useSoundEffects = (): SoundEffects => useContext(SoundsContext);
