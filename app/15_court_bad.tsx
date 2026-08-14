import React from "react";

import DialogScene from "@/components/scene/DialogScene";

import {
    useSceneMusic,
} from "@/components/audio/useSceneMusic";

import {
    MUSIC,
} from "@/components/audio/musicMap";

export default function CourtBadScene() {
    useSceneMusic(
        MUSIC.crime
    );

    return (
        <DialogScene
            onEnd={async (
                fadeToScene
            ) => {
                await fadeToScene(
                    "14_kanagawa_house_search",
                    {
                        /*
                         * id: 70 → индекс 69.
                         */
                        lineIndex: 69,

                        background:
                            "kanagawa_house_outdoor",

                        resizeMode:
                            "cover",

                        holdMs: 300,
                    }
                );
            }}
        />
    );
}