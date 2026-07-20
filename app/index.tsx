import React, {useEffect, useState} from "react";
import {View, Text, StyleSheet, ImageBackground, Pressable} from "react-native";
import {globalStyles, isTablet} from "@/styles/global";
import {useGameStore} from "@/store/gameStore";
import MainMenu from "@/components/MainMenu";
import {getBackground} from "@/tools/utils";
import SceneFade from "@/components/SceneFade";
import {MUSIC} from "@/components/audio/musicMap";
import {useSceneMusic} from "@/components/audio/useSceneMusic";
import LoadingScreen from "@/app/loading";
import {preloadAssetsWithProgress} from "@/tools/preload";
import {PRELOAD_IMAGES, PRELOAD_SOUNDS} from "@/assets/preloadList";
import AppText from "@/components/Common/AppText";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
    const { lang, loadProgress, resetProgress, hasSave, checkHasSave, } = useGameStore();

    const [ready, setReady] = useState(false);
    const [progress, setProgress] = useState(0);

    useSceneMusic(ready ? MUSIC.exploration : null as any);

    useEffect(() => {
        (async () => {
            try {
                await preloadAssetsWithProgress(
                    PRELOAD_IMAGES,
                    PRELOAD_SOUNDS,
                    setProgress
                );

                const savedExists = await checkHasSave();

                if (savedExists) {
                    await loadProgress();
                }
            } catch (e) {
                console.warn("Init error:", e);
            } finally {
                setReady(true);
            }
        })();
    }, []);

    // пока не готово — показываем лоадер
    if (!ready) {
        return <LoadingScreen progress={progress} />;
    }

    return (
        <SceneFade>
            {(fadeToScene) => (
            <ImageBackground
                source={getBackground("default")}
                style={[globalStyles.screen]}
                resizeMode="cover"
            >
                <View style={globalStyles.menu}>
                    <AppText style={styles.title}>{lang === "ru" ? "Детектив D." : "Detective D."}</AppText>
                    {/*<View style={styles.btn}>*/}
                    {/*    <Link style={styles.btnText} href="street_intro">{lang === "ru" ? "Начать" : "Start"}</Link>*/}
                    {/*</View>*/}
                    <Pressable
                        style={styles.btn}
                        onPress={async () => {
                            await resetProgress();
                            fadeToScene("2_street_intro");
                        }}
                    >
                        <AppText style={styles.btnText}>
                            {lang === "ru" ? "Новая игра" : "New game"}
                        </AppText>
                    </Pressable>
                    {hasSave && (
                        <Pressable
                            style={styles.btn}
                            onPress={() => {
                                const scene = useGameStore.getState().currentScene;

                                fadeToScene(scene, {
                                    keepState: true,
                                });
                            }}
                        >
                            <AppText style={styles.btnText}>
                                {lang === "ru" ? "Продолжить" : "Continue"}
                            </AppText>
                        </Pressable>
                    )}
                </View>
                {/* Главное меню */}
                <MainMenu mainScreen={true} />
            </ImageBackground>
            )}
        </SceneFade>
    );
}

const styles = StyleSheet.create({
    title: {
        fontSize: isTablet ? 56 : 36,
        color: "#fff",
        fontWeight: "bold",
        marginBottom: 40,
        textShadowColor: "rgba(0,0,0,0.7)",
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4,
    },
    btn: {
        backgroundColor: "rgba(20,20,20,0.8)",
        paddingVertical: 12,
        paddingHorizontal: 48,
        borderRadius: 10,
        minWidth: 200,
        alignItems: "center",
    },
    btnText: {
        color: "#fff",
        fontSize: isTablet ? 32 : 18,
        fontWeight: "600",
    },
});
