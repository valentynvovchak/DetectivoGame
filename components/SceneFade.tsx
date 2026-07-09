import React, { useRef } from "react";
import { Animated, StyleSheet } from "react-native";
import { router } from "expo-router";

import { useGameStore } from "@/store/gameStore";

type FadeOptions = {
    keepState?: boolean;

    // сколько держать полностью чёрный экран
    holdMs?: number;
};

interface Props {
    children: (
        fadeToScene: (
            nextScene: string,
            options?: FadeOptions
        ) => Promise<void>
    ) => React.ReactNode;
}

export default function SceneFade({ children }: Props) {
    const { changeScene } = useGameStore();

    const fadeAnim = useRef(
        new Animated.Value(0)
    ).current;

    const fadeToScene = async (
        nextScene: string,
        options: FadeOptions = {}
    ) => {
        const {
            keepState = false,
            holdMs = 500,
        } = options;

        // 1. Плавное затемнение
        await new Promise<void>((resolve) => {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }).start(() => resolve());
        });

        // 2. Полностью чёрный экран
        if (holdMs > 0) {
            await new Promise((resolve) =>
                setTimeout(resolve, holdMs)
            );
        }

        // 3. Переход
        if (nextScene === "map") {
            router.replace("/map");
        } else if (keepState) {
            router.replace(`/${nextScene}`);
        } else {
            await changeScene(nextScene);
        }

        // 4. Плавное появление
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 900,
            useNativeDriver: true,
        }).start();
    };

    return (
        <>
            {children(fadeToScene)}

            <Animated.View
                pointerEvents="none"
                style={[
                    styles.overlay,
                    {
                        opacity: fadeAnim,
                    },
                ]}
            />
        </>
    );
}

const styles = StyleSheet.create({
    overlay: {
        position: "absolute",

        top: 0,
        left: 0,
        right: 0,
        bottom: 0,

        backgroundColor: "#000",

        zIndex: 99999,
        elevation: 99999,
    },
});