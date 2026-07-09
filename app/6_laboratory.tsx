import React, { useEffect } from "react";
import DialogScene from "@/components/scene/DialogScene";
import { useSceneMusic } from "@/components/audio/useSceneMusic";
import { MUSIC } from "@/components/audio/musicMap";
import { useGameStore } from "@/store/gameStore";
import ClueFlyAnimation from "@/components/animations/ClueFlyAnimation";
import { height, width } from "@/styles/global";
import {router} from "expo-router";
import dialogs from "@/data/dialogs.json";

export default function LaboratoryScene() {
    useSceneMusic(MUSIC.crime);

    const { lang, addToData, hasItem, currentScene, currentLine } = useGameStore();
    const dialogs = require("@/data/dialogs.json");
    const scene = dialogs[currentScene];
    const line = scene?.dialog?.[currentLine];

    useEffect(() => {
        if (line?.openMap) router.replace("/map");
    }, [line?.openMap]);

    return (
        <DialogScene
            // onEnd={(fadeToScene) => fadeToScene("6_laboratory")}
            /*renderOverlays={({ line }) => (
                <>
                    {line?.id === 8 && !hasItem("facts", "mrs_kanagawa_no_conflicts") && (
                        <ClueFlyAnimation
                            text={lang === "ru"
                                ? "mrs. Kanagawa не конфликтировала ни с кем"
                                : "mrs. Kanagawa had no conflicts with anyone"}
                            start={{ x: width * 0.001, y: -height * 0.28 }}
                            end={{ x: width / 4.5, y: height }}
                            onFinish={() => addToData("facts", "mrs_kanagawa_no_conflicts")}
                        />
                    )}
                </>
            )}*/
        />
    );
}
