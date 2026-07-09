import React, { useState } from "react";

import DialogScene from "@/components/scene/DialogScene";
import { useSceneMusic } from "@/components/audio/useSceneMusic";
import { MUSIC } from "@/components/audio/musicMap";
import { useGameStore } from "@/store/gameStore";
import AddModal from "@/components/AddModal";

export default function KanagawaHouseScene() {
    useSceneMusic(MUSIC.crime);

    const {
        lang,
        currentScene,
        currentLine,
        nextLine,
        goToLine,
        reopenLocation,
        setMapNotification,
        setLocationTarget,
    } = useGameStore();

    const dialogs = require("@/data/dialogs.json");
    const scene = dialogs[currentScene];
    const line = scene?.dialog?.[currentLine];
    const [carInspectionModal, setCarInspectionModal] = useState(false);
    const carHotspot = line?.hotspots?.find(
        (hotspot: any) => hotspot.id === "kanagawa_car"
    );

    return (
        <DialogScene
            onEnd={(fadeToScene) => {
                fadeToScene("7_kanagawa_house");
            }}
            onHotspotPress={(spot, { line }) => {
                // Открываем предложение отправить машину на техосмотр
                if (
                    spot.id === "kanagawa_car" &&
                    spot.type === "inspect"
                ) {
                    setCarInspectionModal(true);
                    return;
                }
                // Остальная логика сцены
                if (spot.type === "inspect") {
                    if (spot.id === "canagava_documents") {
                        nextLine();
                        return;
                    }
                    if (spot.id === "car_eye") {
                        goToLine(4);
                        return;
                    }
                }
                // if (
                //     spot.type === "open" &&
                //     spot.id === "car_pointer"
                // ) {
                //     nextLine();
                // }
            }}

            renderOverlays={({ line, fadeToScene }) => (
                <>
                    {carInspectionModal && carHotspot && (
                        <AddModal
                            lang={lang}
                            name={
                                carHotspot.name?.[lang] ||
                                (lang === "ru"
                                    ? "Машина миссис Канагавы"
                                    : "Mrs. Kanagawa's car")
                            }
                            question={
                                lang === "ru"
                                    ? "Отправить её на техосмотр?"
                                    : "Send it for inspection?"
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
                            toggle={setCarInspectionModal}
                            onAdd={async () => {
                                setCarInspectionModal(false);
                                reopenLocation("6_laboratory");
                                // теперь эта же точка ведёт в новую сцену
                                setLocationTarget(
                                    "6_laboratory",
                                    "8_report_is_ready"
                                );
                                setMapNotification({
                                    id: "car_report_ready",
                                    locationId: "6_laboratory",
                                    text: {
                                        ru: "Отчёт по автомобилю готов!\nВернитесь в полицейский участок, чтобы ознакомиться с ним...",
                                        en: "The report on the car is ready!\nReturn to the police station to review it...",
                                    },
                                });
                                setCarInspectionModal(false);

                                await fadeToScene("map", {
                                    holdMs: 2500,
                                });
                            }}
                            position={carHotspot.modal}
                        />
                    )}
                </>
            )}
        />
    );
}