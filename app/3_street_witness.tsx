import React, {useEffect, useRef, useState} from "react";
import {StyleSheet, Animated, ImageBackground, Pressable, TouchableOpacity, Image} from "react-native";
import dialogs from "@/data/dialogs.json";
import { useGameStore } from "@/store/gameStore";
import {globalStyles, height, width} from "@/styles/global";
import MainMenu from "@/components/MainMenu";
import {getBackground, getSprite} from "@/tools/utils";
import CharacterSpriteNew from "@/components/CharacterSpriteNew";
import SpeechBubble from "@/components/SpeechBubble";
import SceneFade from "@/components/SceneFade";
import ClueFlyAnimation from "@/components/animations/ClueFlyAnimation";
import {RESOURCES} from "@/assets/resources";
import {MUSIC} from "@/components/audio/musicMap";
import {playMusic} from "@/components/audio/audioManager";


export default function WitnessScene() {
    const { currentScene, currentLine, nextLine, lang, addToData, hasItem, volume,
        sceneBackground, sceneResizeMode, setSceneBackground } = useGameStore();
    const scene = dialogs[currentScene];
    const line = scene?.dialog?.[currentLine];
    const [showAnim, setShowAnim] = useState(false);
    const [clicked, setClicked] = useState(false);

    const hotspots = line?.hotspots || [];

    // const [background, setBackground] = useState(scene.background || "");
    // const [resizeMode, setResizeMode] = useState(line?.resizeMode || "cover");
    const [screenClickBlocked, setScreenClickBlocked] = useState(false);

    useEffect(() => {
        playMusic(MUSIC.crime, volume);
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

    const handleHotspotPress = (hotspot, fadeToScene) => {
        if (hotspot.type === "inspect") {
            // addToData("evidence", "car_inspected");
            setClicked(true);
            fadeToScene("4_car_inspection");
            // nextLine();
        }
    };

    return (
        <SceneFade>
            {(fadeToScene) => (
                <Pressable style={{ flex: 1 }} onPress={() => {
                    if (currentLine >= scene.dialog.length - 1) {
                        // fadeToScene("next_scene_name"); // 🎬 плавный переход
                    } else {
                        if (!screenClickBlocked) {
                            nextLine();
                        }
                    }
                }}>
                    <ImageBackground
                        key={sceneBackground}
                        source={getBackground(sceneBackground || scene.background)}
                        resizeMode={sceneResizeMode}
                        style={globalStyles.screen}
                    >
                        {line?.characters && line.characters.map((char) => (
                            <CharacterSpriteNew
                                key={char.id}
                                mode={char.mode}
                                side={char.side}
                                Sprite={getSprite(char.sprite)}
                                isSpeaking={char.id === line.speaker}
                                heightModifier={char?.height_modifier}
                            />
                        ))}

                        {line?.speaker && line.speaker && (
                            <SpeechBubble
                                side={line?.characters && line.characters.find((c) => c.id === line.speaker)?.side || "center"}
                                speaker={line.speaker}
                                text={lang === "ru" ? line.text.ru : line.text.en}
                                mode={line?.bubble_mode || "medium"}
                                charMode={line?.characters && line.characters.find((c) => c.id === line.speaker)?.mode}
                                lang={lang}
                            />
                        )}

                        {line.id === 10 && !hasItem("facts", "red_skin_tone") && (
                            <ClueFlyAnimation
                                text={lang == "ru" ? "Красноватый оттенок кожи" : "Red skin tone"}
                                start={{ x: width*0.001, y: -height*0.28 }} // позиция бабла (можно вычислить)
                                end={{ x: width/4.5, y: height }}  // позиция иконки инвентаря
                                onFinish={() => {
                                    addToData("facts", "red_skin_tone");
                                    !hasItem("dossier", "witness_mei") && addToData("dossier", "witness_mei");
                                    setShowAnim(false);
                                }}
                            />
                        )}

                        {hotspots.map((spot) => (
                            <TouchableOpacity
                                key={spot.id}
                                onPress={() => handleHotspotPress(spot, fadeToScene)}
                                disabled={clicked}
                                style={[
                                    styles.hotspot,
                                    {
                                        left: width * spot.x,
                                        top: height * spot.y,
                                        width: width * spot.width,
                                        height: width * spot.height,
                                    },
                                ]}
                            >
                                <Image
                                    source={RESOURCES[spot.icon]} // например icon_eye.png
                                    // style={{ width: "100%", height: "100%", resizeMode: "contain" }}
                                />
                            </TouchableOpacity>
                        ))}

                        {line?.menu !== false && <MainMenu />}

                        {/* 🔹 Затемнение для плавной смены фона */}
                        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]} />
                    </ImageBackground>
                </Pressable>
            )}
        </SceneFade>
    );
}

const styles = StyleSheet.create({
    hotspot: {
        position: "absolute",
    },
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