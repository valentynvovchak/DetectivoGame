import React, {useEffect, useRef, useState} from "react";
import {StyleSheet, Animated, ImageBackground, Pressable, TouchableOpacity, Image, View, Text} from "react-native";
import dialogs from "@/data/dialogs.json";
import { useGameStore } from "@/store/gameStore";
import {globalStyles, height, width} from "@/styles/global";
import MainMenu from "@/components/MainMenu";
import {getBackground, getSprite} from "@/tools/utils";
import CharacterSpriteNew from "@/components/CharacterSpriteNew";
import SpeechBubble from "@/components/SpeechBubble";
import SceneFade from "@/components/SceneFade";
import {RESOURCES} from "@/assets/resources";
import AddModal from "@/components/AddModal";
import {SCALE} from "@/tools/constants";
import {router} from "expo-router";

export default function CarInspectionScene() {
    const { currentScene, currentLine, nextLine, lang, addToData, goToLine,
        sceneBackground, sceneResizeMode, setSceneBackground  } = useGameStore();
    const scene = dialogs[currentScene];
    const line = scene?.dialog?.[currentLine];
    const [showAnim, setShowAnim] = useState(false);
    const [clicked, setClicked] = useState(false);

    const hotspots = line?.hotspots || [];

    // const [background, setBackground] = useState(scene.background || "");
    // const [resizeMode, setResizeMode] = useState(line?.resizeMode || "cover");
    const [screenClickBlocked, setScreenClickBlocked] = useState(false);
    const [bottleAddModal, setBottleAddModal] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!line?.backgroundNoAnimationChange) return;

        setSceneBackground(
            line.backgroundNoAnimationChange,
            line.resizeMode || "cover"
        );
    }, [line]);

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

    useEffect(() => {
        if (line?.id === 2) {
            setScreenClickBlocked(true);
        } else if (line?.id === 5) {
            setScreenClickBlocked(false);
        }
    }, [line?.id]);

    const handleHotspotPress = (hotspot, fadeToScene) => {
        if (line?.id === 1 && hotspot.type === "inspect") {
            nextLine();
        } else if (hotspot.type === "add_item") {
            setBottleAddModal(true);
            // addToData("evidence", "car_inspected");
            // setClicked(true);
            // fadeToScene("next_scene_name");
            // nextLine();
        } else if (hotspot.type === "inspect") {
            if (hotspot.id == 'car_eye') {
                goToLine(4);
            } else if (['hospital', 'hospital_tag'].includes(hotspot.id)) {
                fadeToScene('5_hospital');
            }
        } else if (hotspot.type == "open") {
            if (hotspot.id == 'car_pointer') {
                nextLine();
            }
        }
    };

    useEffect(() => {
        if (!line?.actions || !Array.isArray(line.actions)) return;

        line.actions.forEach((action: string) => {
            const [type, target] = action.split(":");

            switch (type) {
                case "unlock_location":
                    if (target) {
                        useGameStore.getState().unlockLocation(target);
                    }
                    break;

                default:
                    console.warn("⚠️ Unknown action:", action);
            }
        });
    }, [line]);

    useEffect(() => {
        if (line?.openMap) {
            router.push("/map");
        }
    }, [line?.openMap]);

    const handleBottlesAdd = () => {
        addToData("evidence", "two_bottles");
        // fadeToScene("next_scene_name");
        nextLine();
    };

    return (
        <SceneFade>
            {(fadeToScene) => (
                <Pressable style={{ flex: 1 }} onPress={() => {
                    if (currentLine >= scene.dialog.length - 1) {
                        // fadeToScene("5_hospital"); // 🎬 плавный переход
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

                        {/*{line.id === 10 && !hasItem("facts", "red_skin_tone") && (
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
                        )}*/}
                        {/*{line.id === 2 && setScreenClickBlocked(true)}*/}

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
                                        // width: width * spot.width,
                                        // height: height * spot.height,
                                    },
                                ]}
                            >
                                {spot?.icon &&
                                    <Image
                                        source={RESOURCES[spot.icon]} // например icon_eye.png
                                        style={{ height: height * spot.height, width: width * spot.width, resizeMode: "contain"}}
                                    />
                                }

                                {spot?.breadcrumb && (
                                    <View style={styles.breadcrumbWrap}>
                                        <Text style={styles.breadcrumbText}>
                                            {spot.breadcrumb}
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}

                        {line?.menu !== false && <MainMenu />}

                        {/* 🔹 Затемнение для плавной смены фона */}
                        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]} />

                        {bottleAddModal && (
                            <AddModal
                                lang={lang}
                                name={line?.hotspots.find(h => h.id === "car_two_bottles")?.name?.[lang]}
                                toggle={setBottleAddModal}
                                onAdd={() => handleBottlesAdd()}
                                position={line?.hotspots.find(h => h.id === "car_two_bottles")?.modal} // берет координаты прямо из JSON
                                // position={{ x: 0.4, y: 0.75, width: 0.5, height: 0.2 }} // берет координаты прямо из JSON
                            />
                        )}
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

    // Animation
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

    // BreadCrumb
    breadcrumbWrap: {
        position: "absolute",       // если нужно поверх сцены
        top: 40 * SCALE,            // можно менять
        left: 20 * SCALE,

        backgroundColor: "#EA0F12", // красный как на скрине
        paddingHorizontal: 24 * SCALE,
        paddingVertical: 10 * SCALE,

        borderRadius: 999,          // 🔥 капсула
        alignSelf: "flex-start",

        // Android тень
        elevation: 6,

        // iOS / Web тень
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    breadcrumbText: {
        color: "#fff",
        fontFamily: "BebasNeue-Regular", // или любой твой заголовочный
        fontSize: 56 * SCALE,
        letterSpacing: 1,
    },

});