import React, {useEffect, useState} from "react";
import DialogScene from "@/components/scene/DialogScene";
import { useSceneMusic } from "@/components/audio/useSceneMusic";
import { MUSIC } from "@/components/audio/musicMap";
import { height, width } from "@/styles/global";
import ClueFlyAnimation from "@/components/animations/ClueFlyAnimation";
import {useGameStore} from "@/store/gameStore";

export default function WitnessScene() {
    const { lang, addToData, hasItem, currentScene, currentLine, nextLine } = useGameStore();
    useSceneMusic(MUSIC.crime);
    const [clicked, setClicked] = useState(false);

    const dialogs = require("@/data/dialogs.json");
    const scene = dialogs[currentScene];
    const line = scene?.dialog?.[currentLine];

    return (
        <DialogScene
            hotspotsDisabled={clicked}
            renderOverlays={({ line }) => (
                <>
                    {line?.id === 17 && !hasItem("facts", "red_skin_tone") && (
                        <ClueFlyAnimation
                            text={lang === "ru" ? "Красноватый оттенок кожи" : "Red skin tone"}
                            start={{ x: width * 0.001, y: -height * 0.28 }}
                            end={{ x: width / 4.5, y: height }}
                            onFinish={() => {
                                addToData("facts", "red_skin_tone");
                            }}
                        />
                    )}

                    {line?.id === 19 && !hasItem("dossier", "witness_mei") && (
                        <ClueFlyAnimation
                            text={lang === "ru" ? "Свидетель Мей" : "Witness Mei"}
                            start={{ x: width * 0.001, y: -height * 0.28 }}
                            end={{ x: width / 4.5, y: height }}
                            onFinish={() => {
                                addToData("dossier", "witness_mei");
                            }}
                        />
                    )}
                </>
            )}
            onHotspotPress={(spot, { fadeToScene }) => {
                if (line?.id === 2 && spot.type === "inspect") return nextLine();

                if (spot.type === "inspect") {
                    setClicked(true);
                    fadeToScene("4_car_inspection");
                }
            }}
        />
    );
}