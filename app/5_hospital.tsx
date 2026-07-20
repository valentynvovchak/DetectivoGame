import React, { useEffect } from "react";
import DialogScene from "@/components/scene/DialogScene";
import { useSceneMusic } from "@/components/audio/useSceneMusic";
import { MUSIC } from "@/components/audio/musicMap";
import { useGameStore } from "@/store/gameStore";
import ClueFlyAnimation from "@/components/animations/ClueFlyAnimation";
import { height, width } from "@/styles/global";
import {router} from "expo-router";

export default function HospitalScene() {
    useSceneMusic(MUSIC.exploration);

    const { lang, addToData, hasItem, currentScene, currentLine, nextLine } = useGameStore();
    const dialogs = require("@/data/dialogs.json");
    const scene = dialogs[currentScene];
    const line = scene?.dialog?.[currentLine];

    useEffect(() => {
        if (line?.openMap) router.replace("/map");
    }, [line?.openMap]);

    return (
        <DialogScene
            showHotspots={false}
            // renderOverlays={({ line }) => (
            //     <>
            //         {line?.id === 5 && !hasItem("facts", "mr_kanagawa_surgery") && (
            //             <ClueFlyAnimation
            //                 text={lang === "ru" ?
            //                     "mr. Канагава был на операции" :
            //                     "mr. Kanagawa was on surgery"}
            //                 start={{ x: width * 0.001, y: -height * 0.28 }}
            //                 end={{ x: width / 4.5, y: height }}
            //                 onFinish={() => {}}  // addToData("facts", "mr_kanagawa_surgery")
            //             />
            //         )}
            //     </>
            // )}
            onHotspotPress={(spot, { fadeToScene }) => {
                if (spot.id == "start_dialog" && spot.type === "inspect") return nextLine();
            }}
        />
    );
}
