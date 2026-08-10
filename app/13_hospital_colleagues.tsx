import React from "react";

import DialogScene from "@/components/scene/DialogScene";
import { useSceneMusic } from "@/components/audio/useSceneMusic";
import { MUSIC } from "@/components/audio/musicMap";
import {useGameStore} from "@/store/gameStore";

export default function HospitalColleaguesScene() {
    useSceneMusic(MUSIC.crime);

    const {
        nextLine,
        reopenLocation,
        setLocationTarget,
        setMapNotification,
    } = useGameStore();

    return (
        <DialogScene
            onEnd={async (fadeToScene) => {
                reopenLocation("7_kanagawa_house");

                setLocationTarget(
                    "7_kanagawa_house",
                    "14_kanagawa_house_search"
                );

                setMapNotification({
                    id: "search_kanagawa_house",
                    locationId: "7_kanagawa_house",
                    icon: "kanagawa_house.png",
                    text: {
                        ru: "Проведите обыск в доме мистера Канагавы.",
                        en: "Conduct a search of Mr. Kanagawa's house."
                    }
                });

                await fadeToScene("map", {
                    holdMs: 1200
                });
            }}
            onHotspotPress={(spot) => {
                if (
                    spot.id === "start_interrogation" &&
                    spot.type === "button"
                ) {
                    nextLine();
                    return;
                }

                if (
                    spot.id === "stay_at_home" &&
                    spot.type === "inspect"
                ) {
                    nextLine();
                    return;
                }
            }}
        />
    );
}