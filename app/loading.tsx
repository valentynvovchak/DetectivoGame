import React, { useEffect, useRef } from "react";
import { View, Text, ImageBackground, Image, StyleSheet, Animated } from "react-native";
import AppText from "@/components/Common/AppText";

export default function LoadingScreen({ progress }: { progress: number }) {
    const barAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(barAnim, {
            toValue: progress,
            duration: 120,
            useNativeDriver: false,
        }).start();
    }, [progress]);

    return (
        <ImageBackground
            source={require("@/assets/backgrounds/Фон диалог детективов о расстоянии до дома 2.jpg")}
            style={styles.bg}
            resizeMode="cover"
        >
            <View style={styles.top}>
                <Image
                    source={require("@/assets/logo-removebg.png")}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </View>

            <View style={styles.bottom}>
                <View style={styles.barWrap}>
                    <Animated.View
                        style={[
                            styles.barFill,
                            {
                                width: barAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: ["0%", "100%"],
                                }),
                            },
                        ]}
                    />
                </View>
                <AppText style={styles.text}>
                    Loading… {Math.round(progress * 100)}%
                </AppText>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    bg: { flex: 1, justifyContent: "space-between" },
    top: { paddingTop: 85, alignItems: "center" },
    logo: { width: "100%", height: 200 },
    bottom: { paddingBottom: 80, alignItems: "center" },
    barWrap: {
        width: "70%",
        height: 14,
        borderRadius: 999,
        backgroundColor: "rgba(0,0,0,0.35)",
        overflow: "hidden",
    },
    barFill: { height: "100%", borderRadius: 999, backgroundColor: "#F2A21B" },
    text: {
        marginTop: 12,
        color: "#fff",
        fontSize: 16,
        textShadowColor: "rgba(0,0,0,0.6)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
});


/*
import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, ImageBackground, Image, StyleSheet, Animated } from "react-native";
import { router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

import { preloadAssetsWithProgress } from "@/tools/preload";
import { PRELOAD_IMAGES, PRELOAD_SOUNDS } from "@/assets/preloadList";
import { useGameStore } from "@/store/gameStore";

SplashScreen.preventAutoHideAsync(); // держим нативный splash пока не готовы

export default function AppEntry() {
    const [progress, setProgress] = useState(0);
    const [ready, setReady] = useState(false);
    const barAnim = useRef(new Animated.Value(0)).current;

    const loadProgress = useGameStore((s) => s.loadProgress);
    const currentScene = useGameStore((s) => s.currentScene);

    useEffect(() => {
        Animated.timing(barAnim, {
            toValue: progress,
            duration: 120,
            useNativeDriver: false,
        }).start();
    }, [progress]);

    useEffect(() => {
        (async () => {
            try {
                // 1) подгружаем ассеты с прогрессом
                await preloadAssetsWithProgress(PRELOAD_IMAGES, PRELOAD_SOUNDS, setProgress);

                // 2) грузим сохранение
                await loadProgress();

                setReady(true);
            } catch (e) {
                console.warn("Init error:", e);
                // даже если ошибка — пропускаем дальше, чтоб не зависнуть
                setReady(true);
            }
        })();
    }, []);

    useEffect(() => {
        (async () => {
            if (!ready) return;
            await SplashScreen.hideAsync();

            // старт сцены: если loadProgress поставил currentScene — иди туда
            router.replace(`/${currentScene || "2_street_intro"}`);
        })();
    }, [ready]);

    const percent = Math.round(progress * 100);

    return (
        <ImageBackground
            source={require("@/assets/loading/loading_bg.png")}
            style={styles.bg}
            resizeMode="cover"
        >
            <View style={styles.top}>
                <Image
                    source={require("@/assets/loading/logo1.png")}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </View>

            <View style={styles.bottom}>
                <View style={styles.barWrap}>
                    <Animated.View
                        style={[
                            styles.barFill,
                            {
                                width: barAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: ["0%", "100%"],
                                }),
                            },
                        ]}
                    />
                </View>

                <Text style={styles.loadingText}>
                    Loading… {percent}%
                </Text>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    bg: {
        flex: 1,
        justifyContent: "space-between",
    },
    top: {
        paddingTop: 80,
        alignItems: "center",
    },
    logo: {
        width: "78%",
        height: 140,
    },
    bottom: {
        paddingBottom: 80,
        alignItems: "center",
    },
    barWrap: {
        width: "70%",
        height: 14,
        borderRadius: 999,
        backgroundColor: "rgba(0,0,0,0.35)",
        overflow: "hidden",
    },
    barFill: {
        height: "100%",
        borderRadius: 999,
        backgroundColor: "#F2A21B", // как у тебя на примере
    },
    loadingText: {
        marginTop: 12,
        color: "#fff",
        fontSize: 16,
        textShadowColor: "rgba(0,0,0,0.6)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
});
*/
