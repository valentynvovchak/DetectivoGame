import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
// import { useFonts } from "expo-font/build/FontHooks";
import { useFonts } from "expo-font";
import { useEffect } from "react";
import { Audio } from "expo-av";
import {stopMusic} from "@/components/audio/audioManager";
import {AppState, Platform} from "react-native";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [loaded] = useFonts({
        "BebasNeue-Regular": require("../assets/fonts/BebasNeue-Regular.ttf"),
        "Lobster-Regular": require("../assets/fonts/Lobster-Regular.ttf"),
        "Pacifico-Regular": require("../assets/fonts/Pacifico-Regular.ttf"),
        "Oswald-Regular": require("../assets/fonts/oswald/static/Oswald-Regular.ttf"),
        // "MyFont-Bold": require("./assets/fonts/MyFont-Bold.ttf"),
        // "MyFont-Italic": require("./assets/fonts/MyFont-Italic.ttf"),
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
                    presentation: "transparentModal", // или "modal"
                    animation: "fade",
                    contentStyle: { backgroundColor: "rgba(0,0,0,0.35)" },
                }}
            />
        </Stack>
    );
}
