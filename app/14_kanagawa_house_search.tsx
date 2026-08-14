import React, {useEffect, useState} from "react";

import DialogScene from "@/components/scene/DialogScene";
import AddModal from "@/components/AddModal";
import { useGameStore } from "@/store/gameStore";
import { useSceneMusic } from "@/components/audio/useSceneMusic";
import { MUSIC } from "@/components/audio/musicMap";
import CourtCaseBuilderModal from "@/components/CourtCaseBuilderModal";

export default function KanagawaHouseSearchScene() {
    useSceneMusic(MUSIC.crime);

    const [plugModalOpen, setPlugModalOpen] =
        useState(false);
    const [courtModalOpen, setCourtModalOpen] =
        useState(false);

    const {
        lang,
        goToLine,
        addToData,
        setSceneBackground,
        currentScene,
        currentLine,
    } = useGameStore();

    const dialogs =
        require("@/data/dialogs.json");

    const scene =
        dialogs[currentScene];

    const line =
        scene?.dialog?.[currentLine];

    useEffect(() => {
        if (line?.courtSelection === true) {
            setCourtModalOpen(true);
        }
    }, [line?.id]);


    return (
        <DialogScene
            canAdvance={(line) => {
                if ([56, 57, 58, 59].includes(line?.id)) {
                    setSceneBackground("youngest_son_room");
                    goToLine(54);

                    return false;
                }

                return line?.tapToContinue !== false;
            }}

            onHotspotPress={(spot) => {
                switch (spot.id) {
                    case "inspect_toy_shelf":
                        goToLine(55);
                        return;

                    case "inspect_left_floor":
                        goToLine(56);
                        return;

                    case "inspect_center_floor":
                        goToLine(57);
                        return;

                    case "inspect_computer":
                        goToLine(58);
                        return;

                    case "inspect_right_floor":
                        goToLine(59);
                        return;

                    case "yoga_ball_plug":
                        setPlugModalOpen(true);
                        return;
                }
            }}

            renderOverlays={({ line, fadeToScene }) => {
                const plugHotspot =
                    line?.hotspots?.find(
                        (hotspot: any) =>
                            hotspot.id ===
                            "yoga_ball_plug"
                    );

                return (
                    <>
                        {plugModalOpen && plugHotspot && (
                            <AddModal
                                lang={lang}
                                name={
                                    plugHotspot.name?.[lang] ??
                                    (lang === "ru"
                                        ? "Заглушка мяча для йоги"
                                        : "Yoga ball plug")
                                }
                                question={
                                    lang === "ru"
                                        ? "Добавить в инвентарь?"
                                        : "Add to inventory?"
                                }
                                confirmText={
                                    lang === "ru"
                                        ? "Да"
                                        : "Yes"
                                }
                                cancelText={
                                    lang === "ru"
                                        ? "Нет"
                                        : "No"
                                }
                                position={plugHotspot.modal}
                                toggle={setPlugModalOpen}
                                onAdd={() => {
                                    addToData(
                                        "evidence",
                                        "yoga_ball_plug"
                                    );

                                    setPlugModalOpen(false);
                                    goToLine(60);
                                }}
                            />
                        )}
                        <CourtCaseBuilderModal
                            visible={courtModalOpen}
                            onClose={() => {
                                setCourtModalOpen(false);
                                goToLine(69);
                            }}
                            onSubmit={async ({
                                 correct,
                                 answer,
                            }) => {
                                console.log(
                                    "Court answer:",
                                    answer
                                );

                                setCourtModalOpen(
                                    false
                                );

                                if (correct) {
                                    await fadeToScene(
                                        "15_court_good",
                                        {
                                            holdMs: 1800,
                                        }
                                    );

                                    return;
                                }

                                await fadeToScene(
                                    "15_court_bad",
                                    {
                                        holdMs: 1800,
                                    }
                                );
                            }}
                        />
                    </>
                );
            }}
        />
    );
}