/*
// components/ClueFlyAnimation.tsx
import React, { useEffect, useRef } from "react";
import { Animated, Text, StyleSheet } from "react-native";
import {isSmallScreen, isTablet} from "@/styles/global";

interface Props {
    text: string;
    start: { x: number; y: number };
    end: { x: number; y: number };
    onFinish?: () => void;
}

export default function ClueFlyAnimation({ text, start, end, onFinish }: Props) {
    const position = useRef(new Animated.ValueXY(start)).current;
    const opacity = useRef(new Animated.Value(1)).current;
    const scale = useRef(new Animated.Value(1)).current;
    const rotate = useRef(new Animated.Value(0)).current; // 🔄 вращение

    useEffect(() => {
        Animated.parallel([
            // движение
            Animated.timing(position, {
                toValue: end,
                duration: 3600,
                useNativeDriver: true,
            }),
            // уменьшение размера
            Animated.timing(scale, {
                toValue: 0.6,
                duration: 3600,
                useNativeDriver: true,
            }),
            // плавное исчезновение
            Animated.sequence([
                Animated.delay(800),
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ]),
            // вращение
            Animated.loop(
                Animated.timing(rotate, {
                    toValue: 1,
                    duration: 900,
                    useNativeDriver: true,
                })
            ),
        ]).start(() => {
            onFinish?.();
        });
    }, []);

    // 🔁 интерполяция вращения
    const rotateInterpolate = rotate.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "200deg"],
    });

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [
                        { translateX: position.x },
                        { translateY: position.y },
                        { scale },
                        { rotate: rotateInterpolate }, // добавлено вращение
                    ],
                    opacity,
                },
            ]}
        >
            <Text style={styles.text}>{text}</Text>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        zIndex: 9999,
    },
    text: {
        backgroundColor: "rgba(255,255,255,0.9)",
        color: "#222",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        fontWeight: "600",
        fontSize: isTablet ? 18 : (isSmallScreen ? 14: 16),
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.1)",
    },
});
*/

// components/ClueFlyAnimation.tsx
import React, { useEffect, useRef } from "react";
import { Animated, Text, StyleSheet } from "react-native";
import { isSmallScreen, isTablet } from "@/styles/global";
import AppText from "@/components/Common/AppText";

interface Props {
    text: string;
    start: { x: number; y: number };
    end: { x: number; y: number };
    onFinish?: () => void;
}

export default function ClueFlyAnimation({ text, start, end, onFinish }: Props) {
    const progress = useRef(new Animated.Value(0)).current; // 0 → 1 движение по траектории
    const opacity = useRef(new Animated.Value(1)).current;
    const scale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.parallel([
            // движение по траектории
            Animated.timing(progress, {
                toValue: 1,
                duration: 2200,
                useNativeDriver: true,
            }),
            // уменьшение
            Animated.timing(scale, {
                toValue: 0.6,
                duration: 2200,
                useNativeDriver: true,
            }),
            // исчезновение
            Animated.sequence([
                Animated.delay(300),
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 1600,
                    useNativeDriver: true,
                }),
            ]),
        ]).start(() => onFinish?.());
    }, []);

    // 🔁 интерполяция координат
    const translateX = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [start.x, end.x],
    });

    // дуга вверх и вниз (парабола)
    const translateY = progress.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [start.y, start.y - 120, end.y], // чем больше "-120", тем выше дуга
    });

    // лёгкое покачивание вокруг оси
    const rotate = progress.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "30deg"],
    });

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [
                        { translateX },
                        { translateY },
                        { scale },
                        { rotate },
                    ],
                    opacity,
                },
            ]}
        >
            <AppText style={styles.text}>{text}</AppText>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        zIndex: 9999,
    },
    text: {
        backgroundColor: "#ebf6ff",
        color: "#222",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        fontWeight: "600",
        fontSize: isTablet ? 18 : isSmallScreen ? 14 : 16,
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.1)",
    },
});
