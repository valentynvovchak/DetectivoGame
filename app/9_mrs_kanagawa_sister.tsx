import React from "react";

import DialogScene from "@/components/scene/DialogScene";
import { useSceneMusic } from "@/components/audio/useSceneMusic";
import { MUSIC } from "@/components/audio/musicMap";
import { useGameStore } from "@/store/gameStore";

export default function MrsKanagawaSisterScene() {
    useSceneMusic(MUSIC.crime);

    const {
        currentScene,
        currentLine,
        nextLine,
        addToData,
    } = useGameStore();

    const dialogs = require("@/data/dialogs.json");
    const scene = dialogs[currentScene];
    const line = scene?.dialog?.[currentLine];


    return (
        <DialogScene
            onEnd={(fadeToScene) => {
                fadeToScene("9_mrs_kanagawa_sister");
            }}
            onHotspotPress={(spot, { line }) => {

            }}
        />
    );
}