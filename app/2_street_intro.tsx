import React from "react";

import DialogScene from "@/components/scene/DialogScene";
import { useSceneMusic } from "@/components/audio/useSceneMusic";
import { MUSIC } from "@/components/audio/musicMap";
import ClueFlyAnimation from "@/components/animations/ClueFlyAnimation";
import { height, width } from "@/styles/global";
import { useGameStore } from "@/store/gameStore";

export default function StreetScene() {
    const {
        lang,
        addToData,
        hasItem,
    } = useGameStore();

    useSceneMusic(MUSIC.exploration);

    return (
        <DialogScene
            // renderTopOverlays={({ line }) =>
            //     line?.id === 11 &&
            //     !hasItem("facts", "two_bodies") ? (
            //         <ClueFlyAnimation
            //             text={
            //                 lang === "ru"
            //                     ? "В автомобиле обнаружены два тела"
            //                     : "Two bodies were found inside the car"
            //             }
            //             icon="two_bodies.png"
            //             category="facts"
            //             lang={lang}
            //             start={{
            //                 x: width * 0.5,
            //                 y: height * 0.25,
            //             }}
            //             end={{
            //                 x: width * 0.68,
            //                 y: height * 0.91,
            //             }}
            //             onFinish={() => {
            //                 addToData("facts", "two_bodies");
            //             }}
            //         />
            //     ) : null
            // }
            onEnd={(fadeToScene) =>
                fadeToScene("3_street_witness")
            }
        />
    );
}