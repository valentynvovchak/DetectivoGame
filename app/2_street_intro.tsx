import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Pressable, Animated, ImageBackground } from "react-native";
import dialogs from "@/data/dialogs.json";
import { useGameStore } from "@/store/gameStore";
import { globalStyles } from "@/styles/global";
import MainMenu from "@/components/MainMenu";
import { getBackground, getSprite } from "@/tools/utils";
import CharacterSpriteNew from "@/components/CharacterSpriteNew";
import SpeechBubble from "@/components/SpeechBubble";
import SceneFade from "@/components/SceneFade";
import {playMusic} from "@/components/audio/audioManager";
import {MUSIC} from "@/components/audio/musicMap";

export default function StreetScene() {
    const { currentScene, currentLine, nextLine, lang, volume,
        sceneBackground, sceneResizeMode, setSceneBackground, setPendingBackground, applyPendingBackground } = useGameStore();

    const scene = dialogs[currentScene];
    const line = scene?.dialog?.[currentLine];

    const [screenClickBlocked, setScreenClickBlocked] = useState(false);

    useEffect(() => {
        playMusic(MUSIC.exploration, volume);
    }, []);

    useEffect(() => {
        if (!line?.backgroundNoAnimationChange) return;

        setSceneBackground(
            line.backgroundNoAnimationChange,
            line.resizeMode || "cover"
        );
    }, [line]);

    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (line?.backgroundChange && line.backgroundChange !== sceneBackground) {
            Animated.sequence([
                Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
                Animated.delay(200),
            ]).start(() => {
                setSceneBackground(
                    line.backgroundChange,
                    line.resizeMode || "cover"
                );
                Animated.timing(fadeAnim, { toValue: 0, duration: 600, useNativeDriver: true }).start();
            });
        }
    }, [line]);

    /*useEffect(() => {
        if (!line?.backgroundChange) return;
        if (line.backgroundChange === sceneBackground) return;

        // 1️⃣ кладём фон "в ожидание"
        setPendingBackground(
            line.backgroundChange,
            line.resizeMode || "cover"
        );

        // 2️⃣ затемняем экран
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
        }).start(() => {
            // 3️⃣ применяем фон, КОГДА ЭКРАН ЧЁРНЫЙ
            applyPendingBackground();

            // 4️⃣ гарантируем, что RN успел перерисоваться
            requestAnimationFrame(() => {
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }).start();
            });
        });
    }, [line?.id]);*/



    return (
        <SceneFade>
            {(fadeToScene) => (
                <Pressable
                    style={{ flex: 1 }}
                    onPress={() => {
                        if (currentLine >= scene.dialog.length - 1) {
                            fadeToScene("3_street_witness")
                        } else {
                            if (!screenClickBlocked) {
                                nextLine();
                            }
                        }
                    }}
                >
                    <Animated.View style={{ flex: 1, opacity: fadeAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 0.3], // можно сделать чуть мягче, не полное исчезание
                        })}}>
                        <ImageBackground
                            key={sceneBackground}
                            source={getBackground(sceneBackground || scene.background)}
                            resizeMode={sceneResizeMode}
                            style={globalStyles.screen}
                        >
                            {line?.characters?.map((char) => (
                                <CharacterSpriteNew
                                    key={char.id}
                                    mode={char.mode}
                                    side={char.side}
                                    Sprite={getSprite(char.sprite)}
                                    isSpeaking={char.id === line.speaker}
                                    heightModifier={char?.height_modifier}
                                />
                            ))}

                            {line?.speaker && (
                                <SpeechBubble
                                    side={line?.characters && line.characters.find((c) => c.id === line.speaker)?.side || "center"}
                                    speaker={line.speaker}
                                    text={lang === "ru" ? line.text.ru : line.text.en}
                                    mode={line?.bubble_mode || "medium"}
                                    lang={lang}
                                />
                            )}

                            {line?.menu !== false && <MainMenu />}
                        </ImageBackground>
                    </Animated.View>

                    {/* 🔹 затемнение поверх — как и раньше */}
                    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]} />
                </Pressable>
            )}
        </SceneFade>
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
        pointerEvents: "none",
    },
});

