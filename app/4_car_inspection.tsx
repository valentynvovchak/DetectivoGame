import React, { useEffect, useState } from "react";
import { router } from "expo-router";
import DialogScene from "@/components/scene/DialogScene";
import AddModal from "@/components/AddModal";
import { useGameStore } from "@/store/gameStore";
import {useSceneMusic} from "@/components/audio/useSceneMusic";
import {MUSIC} from "@/components/audio/musicMap";

export default function CarInspectionScene() {
    const { lang, nextLine, goToLine, addToData, currentScene, currentLine } = useGameStore();
    useSceneMusic(MUSIC.crime);

    const dialogs = require("@/data/dialogs.json");
    const scene = dialogs[currentScene];
    const line = scene?.dialog?.[currentLine];

    const [clicked, setClicked] = useState(false);
    const [screenClickBlocked, setScreenClickBlocked] = useState(false);
    const [bottleAddModal, setBottleAddModal] = useState(false);

    useEffect(() => {
        if (line?.id === 2) setScreenClickBlocked(true);
        else if (line?.id === 5) setScreenClickBlocked(false);
    }, [line?.id]);

    // useEffect(() => {
    //     if (!line?.actions || !Array.isArray(line.actions)) return;
    //     line.actions.forEach((action: string) => {
    //         const [type, target] = action.split(":");
    //         if (type === "unlock_location" && target) {
    //             useGameStore.getState().unlockLocation(target);
    //         }
    //     });
    // }, [line?.id]);

    useEffect(() => {
        if (line?.openMap) router.replace("/map");
    }, [line?.openMap]);

    return (
        <DialogScene
            canAdvance={() => !screenClickBlocked}
            hotspotsDisabled={clicked}
            onHotspotPress={(spot, { fadeToScene, line }) => {
                if (line?.id === 1 && spot.type === "inspect") return nextLine();

                if (spot.type === "add_item") return setBottleAddModal(true);

                if (spot.type === "inspect") {
                    if (spot.id === "canagava_documents") return nextLine();
                    if (spot.id === "car_eye") return goToLine(4);
                    if (["hospital", "hospital_tag"].includes(spot.id)) return fadeToScene("5_hospital");
                }

                if (spot.type === "open" && spot.id === "car_pointer") return nextLine();
            }}
            renderOverlays={({ line }) => (
                bottleAddModal ? (
                    <AddModal
                        lang={lang}
                        name={line?.hotspots?.find((h: any) => h.id === "car_two_bottles")?.name?.[lang]}
                        toggle={setBottleAddModal}
                        onAdd={() => {
                            addToData("evidence", "two_bottles");
                            nextLine();
                        }}
                        position={line?.hotspots?.find((h: any) => h.id === "car_two_bottles")?.modal}
                    />
                ) : null
            )}
        />
    );
}