import React from "react";

import DialogScene from "@/components/scene/DialogScene";
import { useSceneMusic } from "@/components/audio/useSceneMusic";
import { MUSIC } from "@/components/audio/musicMap";
import {router} from "expo-router";

export default function CourtGoodScene() {
    useSceneMusic(MUSIC.crime);

    return (
        <DialogScene
            onEnd={async (fadeToScene) => {
                await router.replace('/');
            }}
        />
    );
}