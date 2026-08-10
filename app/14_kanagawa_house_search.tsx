import React from "react";

import DialogScene from "@/components/scene/DialogScene";
import { useSceneMusic } from "@/components/audio/useSceneMusic";
import { MUSIC } from "@/components/audio/musicMap";
import {useGameStore} from "@/store/gameStore";

export default function KanagawaHouseSearchScene() {
    useSceneMusic(MUSIC.crime);

    const {

    } = useGameStore();

    return (
        <DialogScene

        />
    );
}