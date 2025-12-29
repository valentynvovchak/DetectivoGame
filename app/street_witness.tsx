import React, {useEffect, useState} from "react";
import {StyleSheet, ImageBackground, Pressable} from "react-native";
import dialogs from "@/data/dialogs.json";
import { useGameStore } from "@/store/gameStore";
import {globalStyles, height, width} from "@/styles/global";
import MainMenu from "@/components/MainMenu";
import CharacterSprite from "@/components/CharacterSprite";
import {getBackground, getSprite} from "@/tools/utils";
import CharacterSpriteNew from "@/components/CharacterSpriteNew";
import SpeechBubble from "@/components/SpeechBubble";
import SceneFade from "@/components/SceneFade";
import ClueFlyAnimation from "@/components/animations/ClueFlyAnimation";


export default function WitnessScene() {
    const { currentScene, currentLine, nextLine, lang, changeScene, addToData, hasItem } = useGameStore();
    const scene = dialogs[currentScene];
    const line = scene?.dialog?.[currentLine];
    const [showAnim, setShowAnim] = useState(false);

    // ✅ безопасная логика смены сцены
    /*useEffect(() => {
        if (!scene || !line) {
            // например, если диалоги закончились — переходим к следующей сцене
            if (currentScene === "street_witness") {
                changeScene("street_intro"); // но только один раз!
            }
        }
    }, [scene, line, currentScene, changeScene]);*/

    return (
        <SceneFade>
            {(fadeToScene) => (
                <Pressable style={{ flex: 1 }} onPress={() => {
                    if (currentLine >= scene.dialog.length - 1) {
                        fadeToScene("next_scene_name"); // 🎬 плавный переход
                    } else {
                        nextLine();
                    }
                }}>
                    <ImageBackground
                        source={getBackground(scene.background)}
                        style={[globalStyles.screen]}
                        resizeMode="cover"
                    >
                        {line.characters.map((char) => (
                            <CharacterSpriteNew
                                key={char.id}
                                mode={char.mode}
                                side={char.side}
                                Sprite={getSprite(char.sprite)}
                                isSpeaking={char.id === line.speaker}
                                heightModifier={char?.height_modifier}
                            />
                        ))}

                        {line.speaker && (
                            <SpeechBubble
                                side={line.characters.find((c) => c.id === line.speaker)?.side || "center"}
                                speaker={line.speaker}
                                text={lang === "ru" ? line.text.ru : line.text.en}
                                mode={line?.bubble_mode || "medium"}
                                charMode={line.characters.find((c) => c.id === line.speaker)?.mode}
                            />
                        )}

                        {line.id === 10 && !hasItem("facts", "red_skin_tone") && (
                            <ClueFlyAnimation
                                text={lang == "ru" ? "Красноватый оттенок кожи" : "Red skin tone"}
                                start={{ x: width*0.001, y: -height*0.28 }} // позиция бабла (можно вычислить)
                                end={{ x: width/4.5, y: height }}  // позиция иконки инвентаря
                                onFinish={() => {
                                    addToData("facts", "red_skin_tone");
                                    setShowAnim(false);
                                }}
                            />
                        )}

                        <MainMenu />
                    </ImageBackground>
                </Pressable>
            )}
        </SceneFade>
    );
}
