import React, {useEffect} from "react";
import {StyleSheet, ImageBackground, Pressable} from "react-native";
import dialogs from "@/data/dialogs.json";
import { useGameStore } from "@/store/gameStore";
import {globalStyles} from "@/styles/global";
import MainMenu from "@/components/MainMenu";
import CharacterSprite from "@/components/CharacterSprite";
import {getBackground, getSprite} from "@/tools/utils";
import CharacterSpriteNew from "@/components/CharacterSpriteNew";
import SpeechBubble from "@/components/SpeechBubble";
import SceneFade from "@/components/SceneFade";

// импортируем спрайты заранее, чтобы require был статическим

export default function StreetScene() {
    const { currentScene, currentLine, nextLine, lang, changeScene } = useGameStore();
    const scene = dialogs[currentScene];
    const line = scene?.dialog?.[currentLine];

    // ✅ безопасная логика смены сцены
    /*useEffect(() => {
        if (!scene || !line) {
            // например, если диалоги закончились — переходим к следующей сцене
            if (currentScene === "street_intro") {
                changeScene("street_witness"); // но только один раз!
            }
        }
    }, [scene, line, currentScene, changeScene]);

    if (!scene || !line) return null;*/
    return (
        <SceneFade>
            {(fadeToScene) => (
                <Pressable
                    style={{ flex: 1 }}
                    onPress={() => {
                        if (currentLine >= scene.dialog.length - 1) {
                            fadeToScene("street_witness"); // 🎬 плавный переход
                        } else {
                            nextLine();
                        }
                    }}
                >
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
                            />
                        )}

                        <MainMenu />
                    </ImageBackground>
                </Pressable>
            )}
        </SceneFade>
    );
}

const styles = StyleSheet.create({

});
