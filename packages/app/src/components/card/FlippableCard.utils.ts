// 'worklet' directive is required — this function is called inside useAnimatedStyle callbacks
// which run on the native worklet thread. Without it, Reanimated crashes on device.
export function isFlipBackFace(progress: number): boolean {
    'worklet';

    return progress < 0.5;
}
