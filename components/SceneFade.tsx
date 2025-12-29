import React, { useRef } from "react";
import { Animated, StyleSheet } from "react-native";
import {useGameStore} from "@/store/gameStore";

interface Props {
    children: (fadeToScene: (nextScene: string) => void) => React.ReactNode;
}

export default function SceneFade({ children }: Props) {
    const { changeScene } = useGameStore();
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const fadeToScene = async (nextScene: string) => {
        // 1️⃣ затемнение
        await new Promise((resolve) => {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start(() => resolve(true));
        });

        // // 2️⃣ Пауза 2 секунды
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // 3️⃣ Переход на новую сцену
        // router.push(`/${nextScene}`);
        await changeScene(nextScene);

        // 4️⃣ Плавное проявление
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 600,
            // delay: 1000,
            useNativeDriver: true,
        }).start();
    };

    return (
        <>
            {children(fadeToScene)}
            <Animated.View style={[styles.overlay, { opacity: fadeAnim }]} />
        </>
    );
}

const styles = StyleSheet.create({
    overlay: {
        pointerEvents: "none",
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "black",
        zIndex: 999,
    },
});
