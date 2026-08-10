import React, { useRef } from "react";

import DialogScene from "@/components/scene/DialogScene";
import { useSceneMusic } from "@/components/audio/useSceneMusic";
import { MUSIC } from "@/components/audio/musicMap";
import { useGameStore } from "@/store/gameStore";

const HOSPITAL_LOCATION_ID = "5_hospital";
const HOSPITAL_COLLEAGUES_SCENE_ID =
    "13_hospital_colleagues";

export default function TestResultsScene() {
    useSceneMusic(MUSIC.crime);

    const transitionStartedRef = useRef(false);

    const {
        reopenLocation,
        setLocationTarget,
        setMapNotification,
        saveProgress,
    } = useGameStore();

    return (
        <DialogScene
            onEnd={async (fadeToScene) => {
                if (transitionStartedRef.current) {
                    return;
                }

                transitionStartedRef.current = true;

                /*
                 * Больница уже посещалась,
                 * поэтому открываем её повторно.
                 */
                reopenLocation(HOSPITAL_LOCATION_ID);

                /*
                 * Теперь точка больницы ведёт
                 * к разговору с коллегой Канагавы.
                 */
                setLocationTarget(
                    HOSPITAL_LOCATION_ID,
                    HOSPITAL_COLLEAGUES_SCENE_ID
                );

                /*
                 * Текст снизу карты, как в дизайне.
                 */
                setMapNotification({
                    id: "talk_to_kanagawa_colleagues",
                    locationId: HOSPITAL_LOCATION_ID,
                    placement: "bottom",
                    icon: "doctor.svg",
                    text: {
                        ru: "Поговорить с коллегами мистера Канагавы в больнице.",
                        en: "Talk to Mr. Kanagawa's colleagues in hospital.",
                    },
                });

                /*
                 * Здесь clearTasks() не вызываем.
                 * Иначе новая задача исчезнет.
                 */
                await saveProgress();

                await fadeToScene("map", {
                    holdMs: 2200,
                });
            }}
        />
    );
}