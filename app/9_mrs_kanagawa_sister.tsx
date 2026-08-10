import React, { useRef } from "react";

import DialogScene from "@/components/scene/DialogScene";
import { useSceneMusic } from "@/components/audio/useSceneMusic";
import { MUSIC } from "@/components/audio/musicMap";
import { useGameStore } from "@/store/gameStore";

const LAWYER_LOCATION_ID = "10_mr_kanagawa_lawyer";
const LAWYER_SCENE_ID = "10_mr_kanagawa_lawyer_1";

export default function MrsKanagawaSisterScene() {
    useSceneMusic(MUSIC.crime);

    const transitionStartedRef = useRef(false);

    const {
        unlockLocation,
        setLocationTarget,
        setMapNotification,
    } = useGameStore();

    return (
        <DialogScene
            onEnd={async (fadeToScene) => {
                // Защита от нескольких быстрых нажатий
                if (transitionStartedRef.current) {
                    return;
                }

                transitionStartedRef.current = true;

                /*
                 * 1. Разблокируем точку на карте.
                 *
                 * LAWYER_LOCATION_ID должен точно совпадать
                 * с ключом внутри mapLocations.
                 */
                unlockLocation(LAWYER_LOCATION_ID);

                /*
                 * 2. Указываем, в какую сцену должна вести
                 * эта точка на карте.
                 */
                setLocationTarget(
                    LAWYER_LOCATION_ID,
                    LAWYER_SCENE_ID
                );

                /*
                 * 3. Создаём уведомление на карте.
                 */
                setMapNotification({
                    id: "mr_kanagawa_lawyer_available",

                    locationId: LAWYER_LOCATION_ID,

                    text: {
                        ru: "Доступна новая локация: Юрист мистера Канагавы",
                        en: "New location available: Mr. Kanagawa's Lawyer",
                    },
                });

                /*
                 * 4. Затемнение:
                 * 500 мс затемнение + 2500 мс чёрный экран
                 * + плавное появление карты.
                 */
                await fadeToScene("map", {
                    holdMs: 2500,
                });
            }}
        />
    );
}