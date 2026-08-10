import React, { useState, useRef } from "react";

import DialogScene from "@/components/scene/DialogScene";
import { useSceneMusic } from "@/components/audio/useSceneMusic";
import { MUSIC } from "@/components/audio/musicMap";
import { useGameStore } from "@/store/gameStore";
import AddModal from "@/components/AddModal";

const BASKETBALL_WRONG_LINE = 8;
const BOTTLES_WRONG_LINE = 9;
const YOGA_BALL_CORRECT_LINE = 11;
const POLICE_LOCATION_ID = "6_laboratory";
const TEST_RESULTS_SCENE_ID = "12_test_results";

export default function CarReinspectionScene() {
    useSceneMusic(MUSIC.crime);

    const [basketBallModal, setBasketBallModal] = useState(false);
    const [bottleModal, setBottleModal] = useState(false);
    const [yogaBallModal, setYogaBallModal] = useState(false);
    const [documentsModal, setDocumentsModal] = useState(false);

    const transitionStartedRef = useRef(false);

    const {
        nextLine,
        lang,
        goToLine,
        reopenLocation,
        setLocationTarget,
        setMapNotification,

        clearTasks,
        saveProgress,
    } = useGameStore();

    const closeAllModals = () => {
        setBasketBallModal(false);
        setBottleModal(false);
        setYogaBallModal(false);
        setDocumentsModal(false);
    };

    const selectBasketball = () => {
        closeAllModals();
        goToLine(BASKETBALL_WRONG_LINE);
    };

    const selectBottles = () => {
        closeAllModals();
        goToLine(BOTTLES_WRONG_LINE);
    };

    const selectYogaBall = () => {
        closeAllModals();
        goToLine(YOGA_BALL_CORRECT_LINE);
    };

    return (
        <DialogScene
            onEnd={async (fadeToScene) => {
                if (transitionStartedRef.current) {
                    return;
                }

                transitionStartedRef.current = true;

                /*
                 * Задачи должны быть пустыми уже на карте,
                 * поэтому очищаем их до перехода.
                 */
                clearTasks();

                /*
                 * Полицейский участок уже посещался —
                 * повторно делаем его доступным.
                 */
                reopenLocation(POLICE_LOCATION_ID);

                /*
                 * Теперь существующая точка участка
                 * ведёт в новую сцену с результатами теста.
                 */
                setLocationTarget(
                    POLICE_LOCATION_ID,
                    TEST_RESULTS_SCENE_ID
                );

                /*
                 * Уведомление сверху карты.
                 *
                 * test_tube.svg замени на точный ключ
                 * своей иконки в MixedIcon.
                 */
                setMapNotification({
                    id: "yoga_ball_test_results_ready",

                    locationId: POLICE_LOCATION_ID,

                    placement: "top",

                    icon: "test_tube.svg",

                    text: {
                        ru: "Результаты анализа готовы!\nОзнакомьтесь с ними в полицейском участке.",
                        en: "The test results are ready!\nCheck them at the police station.",
                    },
                });

                /*
                 * Сохраняем уже очищенные задачи
                 * и повторно открытую точку карты.
                 */
                await saveProgress();

                /*
                 * Затемнение создаёт ощущение,
                 * что экспертиза заняла время.
                 */
                await fadeToScene("map", {
                    holdMs: 2300,
                });
            }}

            onHotspotPress={(spot) => {
                /*
                 * Вход в повторный осмотр машины.
                 */
                if (
                    spot.id === "kanagawa_car" &&
                    spot.type === "inspect"
                ) {
                    nextLine();
                    return;
                }

                /*
                 * Переход к бардачку.
                 */
                if (
                    spot.id === "car_eye" &&
                    spot.type === "inspect"
                ) {
                    goToLine(7);
                    return;
                }

                /*
                 * Открытие бардачка.
                 * Здесь укажи нужную следующую строку,
                 * если она уже предусмотрена.
                 */
                // if (
                //     spot.id === "car_pointer" &&
                //     spot.type === "open"
                // ) {
                //     nextLine();
                //     return;
                // }

                if (
                    spot.id === "car_documents" &&
                    spot.type === "inspect"
                ) {
                    closeAllModals();
                    setDocumentsModal(true);
                    return;
                }

                if (spot.type !== "inspect") {
                    return;
                }

                closeAllModals();

                if (spot.id === "basket_ball") {
                    setBasketBallModal(true);
                    return;
                }

                if (spot.id === "car_two_bottles") {
                    setBottleModal(true);
                    return;
                }

                if (spot.id === "car_yoga_ball") {
                    setYogaBallModal(true);
                }
            }}

            renderOverlays={({ line }) => {
                const hotspots =
                    line?.hotspots ?? [];

                const basketBallHotspot =
                    hotspots.find(
                        (hotspot: any) =>
                            hotspot.id ===
                            "basket_ball"
                    );
                const bottlesHotspot =
                    hotspots.find(
                        (hotspot: any) =>
                            hotspot.id ===
                            "car_two_bottles"
                    );
                const yogaBallHotspot =
                    hotspots.find(
                        (hotspot: any) =>
                            hotspot.id ===
                            "car_yoga_ball"
                    );
                const documentsHotspot = hotspots.find(
                    (hotspot: any) =>
                        hotspot.id === "car_documents"
                );

                return (
                    <>
                        {basketBallModal &&
                            basketBallHotspot && (
                                <AddModal
                                    lang={lang}
                                    name={
                                        basketBallHotspot
                                            .name?.[lang] ??
                                        basketBallHotspot
                                            .name?.en ??
                                        (lang === "ru"
                                            ? "Баскетбольный мяч"
                                            : "Basketball")
                                    }
                                    question={
                                        lang === "ru"
                                            ? "Осмотреть баскетбольный мяч?"
                                            : "Inspect the basketball?"
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
                                    toggle={
                                        setBasketBallModal
                                    }
                                    onAdd={
                                        selectBasketball
                                    }
                                    position={
                                        basketBallHotspot.modal
                                    }
                                />
                            )}

                        {bottleModal &&
                            bottlesHotspot && (
                                <AddModal
                                    lang={lang}
                                    name={
                                        bottlesHotspot
                                            .name?.[lang] ??
                                        bottlesHotspot
                                            .name?.en ??
                                        (lang === "ru"
                                            ? "Бутылки воды"
                                            : "Water bottles")
                                    }
                                    question={
                                        lang === "ru"
                                            ? "Осмотреть бутылки?"
                                            : "Inspect the bottles?"
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
                                    toggle={
                                        setBottleModal
                                    }
                                    onAdd={
                                        selectBottles
                                    }
                                    position={
                                        bottlesHotspot.modal
                                    }
                                />
                            )}

                        {yogaBallModal &&
                            yogaBallHotspot && (
                                <AddModal
                                    lang={lang}
                                    name={
                                        yogaBallHotspot
                                            .name?.[lang] ??
                                        yogaBallHotspot
                                            .name?.en ??
                                        (lang === "ru"
                                            ? "Мяч для йоги"
                                            : "Yoga ball")
                                    }
                                    question={
                                        lang === "ru"
                                            ? "Осмотреть мяч для йоги?"
                                            : "Inspect the yoga ball?"
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
                                    toggle={
                                        setYogaBallModal
                                    }
                                    onAdd={
                                        selectYogaBall
                                    }
                                    position={
                                        yogaBallHotspot.modal
                                    }
                                />
                            )}

                        {documentsModal && documentsHotspot && (
                            <AddModal
                                lang={lang}
                                name={
                                    documentsHotspot.name?.[lang] ??
                                    documentsHotspot.name?.en ??
                                    (lang === "ru"
                                        ? "Документы"
                                        : "Documents")
                                }
                                question={
                                    lang === "ru"
                                        ? "Выбрать документы?"
                                        : "Select the documents?"
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
                                toggle={setDocumentsModal}
                                onAdd={() => {
                                    setDocumentsModal(false);
                                    goToLine(10);
                                }}
                                position={documentsHotspot.modal}
                            />
                        )}
                    </>
                );
            }}
        />
    );
}
