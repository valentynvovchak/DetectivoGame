import React from "react";
import DialogScene from "@/components/scene/DialogScene";
import { useSceneMusic } from "@/components/audio/useSceneMusic";
import { MUSIC } from "@/components/audio/musicMap";
import ClueFlyAnimation from "@/components/animations/ClueFlyAnimation";
import {height, width} from "@/styles/global";
import {useGameStore} from "@/store/gameStore";

export default function StreetScene() {
    const { lang, addToData, hasItem } = useGameStore();
    useSceneMusic(MUSIC.exploration);

    return (
        <DialogScene
            renderOverlays={({ line }) => (
                line?.id === 11 && !hasItem("facts", "two_bodies") ? (
                    <ClueFlyAnimation
                        text={lang === "ru" ? "Два тела" : "Two bodies"}
                        start={{ x: width * 0.001, y: -height * 0.28 }}
                        end={{ x: width / 4.5, y: height }}
                        onFinish={() => {
                            addToData("facts", "two_bodies");
                        }}
                    />
                ) : null
            )}
            onEnd={(fadeToScene) => fadeToScene("3_street_witness")}
        />
    );
}