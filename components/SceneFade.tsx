import React, {
    useRef,
} from "react";

import {
    Animated,
    StyleSheet,
} from "react-native";

import { router } from "expo-router";

import {
    ChangeSceneOptions,
    useGameStore,
} from "@/store/gameStore";

type FadeOptions =
    ChangeSceneOptions & {
    /*
     * Не менять состояние игры,
     * а только открыть route.
     */
    keepState?: boolean;

    /*
     * Сколько держать полностью
     * чёрный экран после перехода.
     */
    holdMs?: number;
};

interface Props {
    children: (
        fadeToScene: (
            nextScene: string,
            options?: FadeOptions
        ) => Promise<void>
    ) => React.ReactNode;
}

const wait = (
    duration: number
) =>
    new Promise<void>((resolve) => {
        setTimeout(resolve, duration);
    });

const waitForNextFrame = () =>
    new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
            resolve();
        });
    });

export default function SceneFade({
                                      children,
                                  }: Props) {
    const {
        changeScene,
        fadeAnim,
    } = useGameStore();

    const transitionInProgress =
        useRef(false);

    const animateOverlay = (
        toValue: number,
        duration: number
    ) =>
        new Promise<void>((resolve) => {
            fadeAnim.stopAnimation();

            Animated.timing(
                fadeAnim,
                {
                    toValue,
                    duration,
                    useNativeDriver:
                        true,
                }
            ).start(() => {
                resolve();
            });
        });

    const fadeToScene = async (
        nextScene: string,
        options: FadeOptions = {}
    ) => {
        if (
            transitionInProgress.current
        ) {
            return;
        }

        transitionInProgress.current =
            true;

        const {
            keepState = false,
            holdMs = 500,

            lineIndex,
            background,
            resizeMode,
        } = options;

        try {
            /*
             * 1. Закрываем текущую сцену.
             */
            await animateOverlay(
                1,
                600
            );

            /*
             * 2. Пока экран полностью чёрный,
             * устанавливаем новую сцену,
             * строку и фон.
             */
            if (nextScene === "map") {
                router.replace("/map");
            } else if (keepState) {
                router.replace(
                    `/${nextScene}`
                );
            } else {
                await changeScene(
                    nextScene,
                    {
                        lineIndex,
                        background,
                        resizeMode,
                    }
                );
            }

            /*
             * Даём новому route смонтироваться.
             *
             * fadeAnim глобальный и всё ещё
             * равен 1, поэтому экран остаётся
             * полностью чёрным.
             */
            await waitForNextFrame();

            if (holdMs > 0) {
                await wait(holdMs);
            }

            /*
             * 3. Показываем уже подготовленную
             * новую сцену.
             */
            await animateOverlay(
                0,
                900
            );
        } finally {
            transitionInProgress.current =
                false;
        }
    };

    return (
        <>
            {children(fadeToScene)}

            <Animated.View
                pointerEvents="none"
                style={[
                    styles.overlay,
                    {
                        opacity:
                        fadeAnim,
                    },
                ]}
            />
        </>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,

        backgroundColor: "#000000",

        zIndex: 99999,
        elevation: 99999,
    },
});

/*
import React, { useRef } from "react";
import { Animated, StyleSheet } from "react-native";
import { router } from "expo-router";

import { useGameStore } from "@/store/gameStore";

type FadeOptions = {
    keepState?: boolean;

    // сколько держать полностью чёрный экран
    holdMs?: number;
};

interface Props {
    children: (
        fadeToScene: (
            nextScene: string,
            options?: FadeOptions
        ) => Promise<void>
    ) => React.ReactNode;
}

export default function SceneFade({ children }: Props) {
    const { changeScene } = useGameStore();

    const fadeAnim = useRef(
        new Animated.Value(0)
    ).current;

    const fadeToScene = async (
        nextScene: string,
        options: FadeOptions = {}
    ) => {
        const {
            keepState = false,
            holdMs = 500,
        } = options;

        // 1. Плавное затемнение
        await new Promise<void>((resolve) => {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }).start(() => resolve());
        });

        // 2. Полностью чёрный экран
        if (holdMs > 0) {
            await new Promise((resolve) =>
                setTimeout(resolve, holdMs)
            );
        }

        // 3. Переход
        if (nextScene === "map") {
            router.replace("/map");
        } else if (keepState) {
            router.replace(`/${nextScene}`);
        } else {
            await changeScene(nextScene);
        }

        // 4. Плавное появление
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 900,
            useNativeDriver: true,
        }).start();
    };

    return (
        <>
            {children(fadeToScene)}

            <Animated.View
                pointerEvents="none"
                style={[
                    styles.overlay,
                    {
                        opacity: fadeAnim,
                    },
                ]}
            />
        </>
    );
}

const styles = StyleSheet.create({
    overlay: {
        position: "absolute",

        top: 0,
        left: 0,
        right: 0,
        bottom: 0,

        backgroundColor: "#000",

        zIndex: 99999,
        elevation: 99999,
    },
});*/
