import React, {useEffect} from "react";

import DialogScene from "@/components/scene/DialogScene";
import { useSceneMusic } from "@/components/audio/useSceneMusic";
import { MUSIC } from "@/components/audio/musicMap";
import { useGameStore } from "@/store/gameStore";
import {router} from "expo-router";

export default function ReportIsReadyScene() {
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

    useEffect(() => {
        if (line?.openMap) router.replace("/map");
    }, [line?.openMap]);


    return (
        <DialogScene
            onEnd={(fadeToScene) => {
                fadeToScene("8_report_is_ready");
            }}
            onHotspotPress={(spot, { line }) => {
                if (
                    spot.type === "button" &&
                    spot.id === "show_report"
                ) {
                    nextLine();
                    return;
                }

                if (spot.id === "add_to_inventory") {
                    addToData(
                        "evidence",
                        "vehicle_inspection_report"
                    );

                    nextLine();
                    return;
                }

                if (spot.type === "inspect") {
                    if (spot.id === "start_dialog") {
                        nextLine();
                        return;
                    }
                }
            }}
        />
    );
}