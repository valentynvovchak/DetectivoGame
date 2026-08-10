import React, {useRef} from "react";

import DialogScene from "@/components/scene/DialogScene";
import { useSceneMusic } from "@/components/audio/useSceneMusic";
import { MUSIC } from "@/components/audio/musicMap";
import {useGameStore} from "@/store/gameStore";

const LAWYER_LOCATION_ID = "10_mr_kanagawa_lawyer";
const LAWYER_SCENE_ID = "10_mr_kanagawa_lawyer_2";

export default function MrKanagawaLawyerScene() {
    useSceneMusic(MUSIC.crime);

    const transitionStartedRef = useRef(false);

    const {
        reopenLocation,
        setLocationTarget,
        setMapNotification
    } = useGameStore();

    return (
        <DialogScene
            onEnd={async (fadeToScene) => {
                /*
                 * Здесь уже должен быть переход
                 * после завершения разговора с юристом.
                 */

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
                reopenLocation(LAWYER_LOCATION_ID);

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
                        ru: "Давайте попробуем поискать новые доказательства в местах, которые вы ещё не проверяли?",
                        en: "Lets` try looking for new evidence in places you haven’t checked yet?",
                    },
                });


                await fadeToScene("map", {
                    holdMs: 1000,
                });
            }}
        />
    );
}