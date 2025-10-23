// components/SceneTransition.tsx
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";

interface Props {
    children: React.ReactNode;
    triggerKey: string; // уникальный ключ, например currentScene
}

export default function SceneTransition({ children, triggerKey }: Props) {
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // затемнение
        Animated.sequence([
            Animated.timing(opacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
            }),
        ]).start();
    }, [triggerKey]); // запускаем при смене сцены

    return (
        <>
            {children}
            <Animated.View pointerEvents="none" style={[styles.overlay, { opacity }]} />
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
        backgroundColor: "black",
        zIndex: 999,
    },
});
