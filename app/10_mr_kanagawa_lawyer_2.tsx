import React, {useRef} from "react";

import DialogScene from "@/components/scene/DialogScene";
import { useSceneMusic } from "@/components/audio/useSceneMusic";
import { MUSIC } from "@/components/audio/musicMap";
import {useGameStore} from "@/store/gameStore";


export default function MrKanagawaLawyer2Scene() {
    useSceneMusic(MUSIC.crime);

    const {
        nextLine
    } = useGameStore();

    return (
        <DialogScene
            onEnd={async (fadeToScene) => {
                /*
                 * Здесь уже должен быть переход
                 * после завершения разговора с юристом.
                 */

                await fadeToScene("map", {
                    holdMs: 1000,
                });
            }}
            onHotspotPress={(spot, { fadeToScene }) => {
                if (spot.id == "start_dialog" && spot.type === "inspect") return nextLine();
            }}
        />
    );
}