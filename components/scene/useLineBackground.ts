import { useEffect, useRef } from "react";
import { Animated } from "react-native";
import { useGameStore } from "@/store/gameStore";

export function useLineBackground(line: any, sceneBackground: string | null) {
    const setSceneBackground = useGameStore((s) => s.setSceneBackground);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    // мгновенная смена без анимации
    useEffect(() => {
        if (!line?.backgroundNoAnimationChange) return;
        setSceneBackground(line.backgroundNoAnimationChange, line.resizeMode || "cover");
    }, [line?.backgroundNoAnimationChange, line?.resizeMode]);

    // смена с затемнением
    useEffect(() => {
        if (!line?.backgroundChange) return;
        if (line.backgroundChange === sceneBackground) return;

        Animated.sequence([
            Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.delay(200),
        ]).start(() => {
            setSceneBackground(line.backgroundChange, line.resizeMode || "cover");
            Animated.timing(fadeAnim, { toValue: 0, duration: 600, useNativeDriver: true }).start();
        });
    }, [line?.backgroundChange, line?.resizeMode, sceneBackground]);

    return fadeAnim;
}
