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

export default function StreetScene() {
    const { currentScene, currentLine, nextLine, lang } = useGameStore();

    const scene = dialogs[currentScene];
    const line = scene?.dialog?.[currentLine];

    const [background, setBackground] = useState(scene.background || "");
    const [resizeMode, setResizeMode] = useState(line?.resizeMode || "cover");
    const [screenClickBlocked, setScreenClickBlocked] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (line?.backgroundChange && line.backgroundChange !== background) {
            Animated.sequence([
                Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
                Animated.delay(200),
            ]).start(() => {
                setBackground(line.backgroundChange); // смена фона
                setResizeMode(line?.resizeMode || "cover"); // смена фона
                Animated.timing(fadeAnim, { toValue: 0, duration: 600, useNativeDriver: true }).start();
            });
        }
    }, [line]);

    return (
        <SceneFade>
            {(fadeToScene) => (
                <Pressable
                    style={{ flex: 1 }}
                    onPress={() => {
                        if (currentLine >= scene.dialog.length - 1) {
                            fadeToScene("street_witness")
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
                            source={getBackground(background)}
                            style={[globalStyles.screen]}
                            resizeMode={resizeMode}
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

