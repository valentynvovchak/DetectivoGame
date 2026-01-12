import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font/build/FontHooks";
import { useEffect } from "react";

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
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    if (!loaded) return null;

    return (
        <Stack screenOptions={{ headerShown: false }} />
    );
}
