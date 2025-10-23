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
import SceneTransition2 from "@/components/animations/SceneTransition2";


export default function WitnessScene() {
    const { currentScene, currentLine, nextLine, lang, setScene } = useGameStore();
    const scene = dialogs[currentScene];
    const line = scene?.dialog?.[currentLine];

    // ✅ безопасная логика смены сцены
    useEffect(() => {
        if (!scene || !line) {
            // например, если диалоги закончились — переходим к следующей сцене
            if (currentScene === "street_witness") {
                setScene("street_intro"); // но только один раз!
            }
        }
    }, [scene, line, currentScene, setScene]);

    return (
        <SceneTransition2 triggerKey={currentScene}>
            {(isVisible) =>
                isVisible && (
                <Pressable style={{ flex: 1 }} onPress={nextLine}>
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
                )
            }
        </SceneTransition2>
    );
}
