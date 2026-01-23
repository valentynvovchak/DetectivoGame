import React, {useEffect} from "react";
import {View, Text, StyleSheet, ImageBackground, Pressable} from "react-native";
import {Link, useRouter} from "expo-router";
import {globalStyles, isTablet} from "@/styles/global";
import {useGameStore} from "@/store/gameStore";
import MainMenu from "@/components/MainMenu";
import {getBackground} from "@/tools/utils";
import SceneFade from "@/components/SceneFade";
import {playMusic} from "@/components/audio/audioManager";
import {MUSIC} from "@/components/audio/musicMap";

export default function Index() {
    const { currentScene, lang, loadProgress, resetProgress, changeScene, volume } = useGameStore();
    const router = useRouter();

    useEffect(() => {
        loadProgress();
        playMusic(MUSIC.exploration, volume);
    }, []);

    return (
        <SceneFade>
            {(fadeToScene) => (
            <ImageBackground
                source={getBackground("default")}
                style={[globalStyles.screen]}
                resizeMode="cover"
            >
                <View style={globalStyles.menu}>
                    <Text style={styles.title}>{lang === "ru" ? "Детектив D." : "Detective D."}</Text>
                    {/*<View style={styles.btn}>*/}
                    {/*    <Link style={styles.btnText} href="street_intro">{lang === "ru" ? "Начать" : "Start"}</Link>*/}
                    {/*</View>*/}
                    <Pressable
                        style={styles.btn}
                        onPress={async () => {
                            await resetProgress(); // очистка сохранения
                            fadeToScene("2_street_intro"); // установка первой сцены
                        }}
                    >
                        <Text style={styles.btnText}>
                            {lang === "ru"
                                ? (currentScene !== 'street_intro' ? 'Новая игра': "Начать")
                                : (currentScene !== 'street_intro'? 'New game': "Start")
                            }
                        </Text>
                    </Pressable>
                    {currentScene !== 'street_intro' && (
                        <Pressable
                            style={styles.btn}
                            onPress={async () => {
                                fadeToScene(currentScene); // установка очередной сцены
                            }}
                        >
                            <Text style={styles.btnText}>{lang === "ru" ? "Продолжить" : "Continue"}</Text>
                        </Pressable>
                    )}
                </View>
                {/* Главное меню */}
                <MainMenu />
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
