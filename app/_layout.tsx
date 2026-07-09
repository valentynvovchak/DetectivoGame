import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { useEffect } from "react";
import { Audio } from "expo-av";
import {AppState, Platform} from "react-native";

SplashScreen.preventAutoHideAsync();

import { useGameStore } from "@/store/gameStore";

function GameHydrator() {
    const loadProgress = useGameStore((s) => s.loadProgress);

    useEffect(() => {
        loadProgress();
    }, []);

    return null;
}

export default function RootLayout() {
    const [loaded] = useFonts({
        // "BebasNeue-Regular": require("../assets/fonts/BebasNeue-Regular.ttf"),
        // "Lobster-Regular": require("../assets/fonts/Lobster-Regular.ttf"),
        // "Pacifico-Regular": require("../assets/fonts/Pacifico-Regular.ttf"),
        // "Oswald-Regular": require("../assets/fonts/oswald/static/Oswald-Regular.ttf"),
        "IBMPlexMono-Regular": require("../assets/fonts/IBMPlexMono/IBMPlexMono-Regular.ttf"),
        "IBMPlexMono-Bold": require("../assets/fonts/IBMPlexMono/IBMPlexMono-Bold.ttf"),
    });

    useEffect(() => {
        // ✅ МИНИМАЛЬНАЯ и СТАБИЛЬНАЯ конфигурация
        if (Platform.OS !== "web") {
            Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
                playsInSilentModeIOS: true,
                shouldDuckAndroid: true,
            });
        }

        const sub = AppState.addEventListener("change", (state) => {
            if (state !== "active") {
                // stopMusic();
            }
        });

        return () => sub.remove();
    }, []);


    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    if (!loaded) return null;

    return (
        <>
            <GameHydrator />

            <Stack screenOptions={{ headerShown: false }}>
                {/* твои сцены */}
                <Stack.Screen name="index" />
                <Stack.Screen name="2_street_intro" />
                <Stack.Screen name="3_street_witness" />
                <Stack.Screen name="4_car_inspection" />
                <Stack.Screen name="5_hospital" />

                {/* ✅ карта как модалка поверх */}
                <Stack.Screen
                    name="map"
                    options={{
                        animation: "fade",
                        gestureEnabled: false,
                    }}
                />
            </Stack>
        </>
    );
}
