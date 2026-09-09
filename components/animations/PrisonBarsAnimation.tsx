import React, {
    useEffect,
    useMemo,
    useRef,
} from "react";

import {
    Animated,
    Easing,
    StyleSheet,
    useWindowDimensions,
    View,
} from "react-native";

import { useAudioPlayer } from "expo-audio";

type Props = {
    onFinished?: () => void;

    /**
     * Затримка перед падінням решітки.
     */
    startDelayMs?: number;

    /**
     * Швидкість основного падіння.
     */
    fallDurationMs?: number;
};

const PRISON_BARS_SOUND = require(
    "../../assets/audio/prison-cell-door-lock.mp3"
);

export default function PrisonBarsAnimation({
                                                onFinished,
                                                startDelayMs = 0,
                                                fallDurationMs = 420,
                                            }: Props) {
    const {
        width,
        height,
    } = useWindowDimensions();

    /**
     * Expo Audio player.
     *
     * downloadFirst потрібен, щоб файл був завантажений
     * до моменту відтворення й звук не запізнювався.
     */
    const soundPlayer = useAudioPlayer(
        PRISON_BARS_SOUND,
        {
            downloadFirst: true,
        }
    );

    /**
     * Початкове значення оновлюється вручну
     * перед кожним запуском анімації.
     */
    const translateY = useRef(
        new Animated.Value(-height * 1.15)
    ).current;

    /**
     * Невелике стискання решітки під час удару.
     */
    const impactScaleY = useRef(
        new Animated.Value(1)
    ).current;

    /**
     * Зберігаємо callback у ref,
     * щоб зміна функції не перезапускала анімацію.
     */
    const onFinishedRef = useRef(onFinished);

    useEffect(() => {
        onFinishedRef.current = onFinished;
    }, [onFinished]);

    const isTablet = width >= 700;

    const barsCount = isTablet ? 12 : 9;

    const sideInset = Math.max(
        14,
        width * 0.035
    );

    const availableWidth =
        width - sideInset * 2;

    const verticalBarWidth = Math.max(
        14,
        Math.min(width * 0.044, 28)
    );

    const horizontalBarHeight = Math.max(
        18,
        Math.min(height * 0.026, 30)
    );

    /**
     * Позиції вертикальних прутів.
     */
    const barPositions = useMemo(() => {
        if (barsCount <= 1) {
            return [width / 2];
        }

        const interval =
            availableWidth / (barsCount - 1);

        return Array.from(
            {
                length: barsCount,
            },
            (_, index) =>
                sideInset + interval * index
        );
    }, [
        availableWidth,
        barsCount,
        sideInset,
        width,
    ]);

    useEffect(() => {
        let cancelled = false;

        let soundTimer:
            | ReturnType<typeof setTimeout>
            | null = null;

        let animation:
            | Animated.CompositeAnimation
            | null = null;

        /**
         * Гучність звуку удару решітки.
         */
        soundPlayer.volume = 0.9;

        /**
         * Зупиняємо попередню анімацію,
         * якщо компонент перезапустив effect.
         */
        translateY.stopAnimation();
        impactScaleY.stopAnimation();

        /**
         * Повертаємо решітку у вихідне положення.
         */
        translateY.setValue(
            -height * 1.15
        );

        impactScaleY.setValue(1);

        /**
         * Основна анімація падіння решітки.
         */
        animation = Animated.sequence([
            /**
             * Затримка перед стартом.
             */
            Animated.delay(startDelayMs),

            /**
             * Основне падіння.
             */
            Animated.timing(translateY, {
                toValue: height * 0.012,
                duration: fallDurationMs,
                easing: Easing.in(
                    Easing.cubic
                ),
                useNativeDriver: true,
            }),

            /**
             * Невеликий відскок після удару.
             */
            Animated.parallel([
                Animated.timing(
                    translateY,
                    {
                        toValue:
                            -height * 0.012,

                        duration: 90,
                        easing: Easing.out(
                            Easing.quad
                        ),

                useNativeDriver: true,
    }
    ),

        Animated.timing(
            impactScaleY,
            {
                toValue: 0.985,
                duration: 90,
                useNativeDriver: true,
            }
        ),
    ]),

        /**
         * Повернення у фінальне положення.
         */
        Animated.parallel([
            Animated.spring(
                translateY,
                {
                    toValue: 0,
                    tension: 180,
                    friction: 8,
                    useNativeDriver: true,
                }
            ),

            Animated.spring(
                impactScaleY,
                {
                    toValue: 1,
                    tension: 180,
                    friction: 8,
                    useNativeDriver: true,
                }
            ),
        ]),
    ]);

        /**
         * Звук запускаємо приблизно за 100 мс
         * до досягнення решіткою нижньої точки.
         *
         * При стандартному fallDurationMs = 420:
         *
         * 420 - 100 = 320 мс
         */
        const soundDelayMs =
            startDelayMs +
            Math.max(
                0,
                fallDurationMs - 100
            );

        soundTimer = setTimeout(() => {
            if (cancelled) {
                return;
            }

            /**
             * Аналог старого replayAsync().
             *
             * Спочатку повертаємо звук на початок,
             * потім запускаємо.
             */
            void soundPlayer
                .seekTo(0)
                .then(() => {
                    if (cancelled) {
                        return;
                    }

                    soundPlayer.play();
                })
                .catch((error) => {
                    console.warn(
                        "Не вдалося відтворити звук решітки:",
                        error
                    );
                });
        }, soundDelayMs);

        /**
         * Старт анімації.
         */
        animation.start(
            ({ finished }) => {
                if (
                    finished &&
                    !cancelled
                ) {
                    onFinishedRef.current?.();
                }
            }
        );

        /**
         * Cleanup.
         */
        return () => {
            cancelled = true;

            if (soundTimer) {
                clearTimeout(soundTimer);
            }

            animation?.stop();

            /**
             * useAudioPlayer сам звільнить player
             * при unmount компонента.
             *
             * Тут лише зупиняємо звук і повертаємо
             * позицію на початок.
             */
            try {
                soundPlayer.pause();

                void soundPlayer
                    .seekTo(0)
                    .catch(() => {});
            } catch {
                // Нічого робити не потрібно.
            }
        };
    }, [
        fallDurationMs,
        height,
        impactScaleY,
        soundPlayer,
        startDelayMs,
        translateY,
    ]);

    /**
     * Позиції горизонтальних перекладин
     * відносно висоти екрана.
     */
    const horizontalBars = [
        0.025,
        0.32,
        0.65,
        0.965,
    ];

    return (
        <Animated.View
            pointerEvents="none"
            style={[
                styles.root,
                {
                    transform: [
                        {
                            translateY,
                        },
                        {
                            scaleY:
                            impactScaleY,
                        },
                    ],
                },
            ]}
        >
            {/* Вертикальні прути */}
            {barPositions.map(
                (left, index) => (
                    <View
                        key={`vertical-bar-${index}`}
                        style={[
                            styles.verticalBar,
                            {
                                left:
                                    left -
                                    verticalBarWidth /
                                    2,

                                width:
                                verticalBarWidth,
                            },
                        ]}
                    >
                        <View
                            style={
                                styles.verticalBarHighlight
                            }
                        />

                        <View
                            style={
                                styles.verticalBarShadow
                            }
                        />
                    </View>
                )
            )}

            {/* Горизонтальні перекладини */}
            {horizontalBars.map(
                (position, index) => (
                    <View
                        key={`horizontal-bar-${index}`}
                        style={[
                            styles.horizontalBar,
                            {
                                top:
                                    height *
                                    position -
                                    horizontalBarHeight /
                                    2,

                                height:
                                horizontalBarHeight,
                            },
                        ]}
                    >
                        <View
                            style={
                                styles.horizontalBarHighlight
                            }
                        />

                        <View
                            style={
                                styles.horizontalBarShadow
                            }
                        />
                    </View>
                )
            )}

            {/* Ліва посилена стійка */}
            <View
                style={[
                    styles.sideFrame,
                    {
                        left: 0,
                        width:
                            verticalBarWidth *
                            1.35,
                    },
                ]}
            />

            {/* Права посилена стійка */}
            <View
                style={[
                    styles.sideFrame,
                    {
                        right: 0,
                        width:
                            verticalBarWidth *
                            1.35,
                    },
                ]}
            />
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    root: {
        ...StyleSheet.absoluteFillObject,

        zIndex: 2_000_000,
        elevation: 2_000_000,

        overflow: "visible",
    },

    verticalBar: {
        position: "absolute",

        top: -30,
        bottom: -30,

        backgroundColor: "#252B2F",

        borderWidth: 2,
        borderColor: "#111518",

        borderRadius: 8,

        elevation: 18,

        shadowColor: "#000000",
        shadowOffset: {
            width: 5,
            height: 3,
        },
        shadowOpacity: 0.65,
        shadowRadius: 6,
    },

    verticalBarHighlight: {
        position: "absolute",

        top: 2,
        bottom: 2,
        left: 3,

        width: 3,

        borderRadius: 4,
        backgroundColor: "rgba(185, 199, 207, 0.52)",
},

verticalBarShadow: {
    position: "absolute",

        top: 2,
        bottom: 2,
        right: 2,

        width: 4,

        borderRadius: 4,

        backgroundColor:
    "rgba(0, 0, 0, 0.5)",
},

horizontalBar: {
    position: "absolute",

        left: -20,
        right: -20,

        backgroundColor: "#30373C",

        borderWidth: 2,
        borderColor: "#111518",

        borderRadius: 7,

        elevation: 24,

        shadowColor: "#000000",
        shadowOffset: {
        width: 0,
            height: 6,
    },
    shadowOpacity: 0.65,
        shadowRadius: 7,
},

horizontalBarHighlight: {
    position: "absolute",

        left: 3,
        right: 3,
        top: 3,

        height: 3,

        borderRadius: 3,

        backgroundColor:
    "rgba(189, 203, 211, 0.48)",
},

horizontalBarShadow: {
    position: "absolute",

        left: 3,
        right: 3,
        bottom: 2,

        height: 4,

        borderRadius: 3,

        backgroundColor:
    "rgba(0, 0, 0, 0.55)",
},

sideFrame: {
    position: "absolute",

        top: -40,
        bottom: -40,

        backgroundColor: "#1C2125",

        borderWidth: 2,
        borderColor: "#090B0C",

        elevation: 28,

        shadowColor: "#000000",
        shadowOffset: {
        width: 0,
            height: 4,
    },
    shadowOpacity: 0.75,
        shadowRadius: 8,
},
});

/*
import React, {
    useEffect,
    useMemo,
    useRef,
} from "react";

import {
    Animated,
    Easing,
    StyleSheet,
    useWindowDimensions,
    View,
} from "react-native";

import { Audio } from "expo-av";

type Props = {
    onFinished?: () => void;

    /!**
     * Задержка перед падением решётки.
     *!/
    startDelayMs?: number;

    /!**
     * Скорость основного падения.
     *!/
    fallDurationMs?: number;
};

export default function PrisonBarsAnimation({
    onFinished,
    startDelayMs = 0,
    fallDurationMs = 420,
}: Props) {
    const {
        width,
        height,
    } = useWindowDimensions();

    /!*
     * Начальное значение обновляется вручную
     * перед каждым запуском анимации.
     *!/
    const translateY = useRef(
        new Animated.Value(-height * 1.15)
    ).current;

    /!*
     * Небольшое сжатие решётки при ударе.
     *!/
    const impactScaleY = useRef(
        new Animated.Value(1)
    ).current;

    /!*
     * Храним callback в ref, чтобы изменение функции
     * не перезапускало всю анимацию.
     *!/
    const onFinishedRef = useRef(onFinished);

    useEffect(() => {
        onFinishedRef.current = onFinished;
    }, [onFinished]);

    const isTablet = width >= 700;

    const barsCount = isTablet ? 12 : 9;

    const sideInset = Math.max(
        14,
        width * 0.035
    );

    const availableWidth =
        width - sideInset * 2;

    const verticalBarWidth = Math.max(
        14,
        Math.min(width * 0.044, 28)
    );

    const horizontalBarHeight = Math.max(
        18,
        Math.min(height * 0.026, 30)
    );

    const barPositions = useMemo(() => {
        if (barsCount <= 1) {
            return [width / 2];
        }

        const interval =
            availableWidth / (barsCount - 1);

        return Array.from(
            {
                length: barsCount,
            },
            (_, index) =>
                sideInset + interval * index
        );
    }, [
        availableWidth,
        barsCount,
        sideInset,
        width,
    ]);

    useEffect(() => {
        let cancelled = false;

        let sound: Audio.Sound | null = null;

        let soundTimer:
            | ReturnType<typeof setTimeout>
            | null = null;

        let animation:
            | Animated.CompositeAnimation
            | null = null;

        const startAnimation = async () => {
            translateY.stopAnimation();
            impactScaleY.stopAnimation();

            translateY.setValue(
                -height * 1.15
            );

            impactScaleY.setValue(1);

            /!*
             * Загружаем звук заранее, чтобы он не запоздал
             * относительно удара решётки.
             *!/
            try {
                const result =
                    await Audio.Sound.createAsync(
                        require(
                            "../../assets/audio/prison-cell-door-lock.mp3"
                        ),
                        {
                            shouldPlay: false,
                            volume: 0.9,
                        }
                    );

                sound = result.sound;
            } catch (error) {
                console.warn(
                    "Не удалось загрузить звук решётки:",
                    error
                );
            }

            if (cancelled) {
                if (sound) {
                    await sound.unloadAsync();
                }

                return;
            }

            animation = Animated.sequence([
                Animated.delay(startDelayMs),

                /!*
                 * Основное падение.
                 *!/
                Animated.timing(translateY, {
                    toValue: height * 0.012,
                    duration: fallDurationMs,
                    easing: Easing.in(
                        Easing.cubic
                    ),
                    useNativeDriver: true,
                }),

                /!*
                 * Отскок после удара.
                 *!/
                Animated.parallel([
                    Animated.timing(
                        translateY,
                        {
                            toValue:
                                -height * 0.012,

                            duration: 90,

                            easing:
                                Easing.out(
                                    Easing.quad
                                ),

                            useNativeDriver: true,
                        }
                    ),

                    Animated.timing(
                        impactScaleY,
                        {
                            toValue: 0.985,
                            duration: 90,
                            useNativeDriver: true,
                        }
                    ),
                ]),

                /!*
                 * Возвращение в конечную позицию.
                 *!/
                Animated.parallel([
                    Animated.spring(
                        translateY,
                        {
                            toValue: 0,
                            tension: 180,
                            friction: 8,
                            useNativeDriver: true,
                        }
                    ),

                    Animated.spring(
                        impactScaleY,
                        {
                            toValue: 1,
                            tension: 180,
                            friction: 8,
                            useNativeDriver: true,
                        }
                    ),
                ]),
            ]);

            /!*
             * Звук включается почти в момент,
             * когда решётка достигает нижней точки.
             *
             * -100 запускает звук немного ізаранее,
             * чтобы металлический удар совпал визуально.
             *!/
            const soundDelayMs =
                startDelayMs +
                Math.max(
                    -1000,
                    fallDurationMs - 2000
                );

            soundTimer = setTimeout(() => {
                if (
                    cancelled ||
                    !sound
                ) {
                    return;
                }

                void sound.replayAsync().catch(
                    (error) => {
                        console.warn(
                            "Не удалось воспроизвести звук решётки:",
                            error
                        );
                    }
                );
            }, soundDelayMs);

            animation.start(
                ({ finished }) => {
                    if (
                        finished &&
                        !cancelled
                    ) {
                        onFinishedRef.current?.();
                    }
                }
            );
        };

        void startAnimation();

        return () => {
            cancelled = true;

            if (soundTimer) {
                clearTimeout(soundTimer);
            }

            animation?.stop();

            const soundToUnload = sound;

            sound = null;

            if (soundToUnload) {
                void soundToUnload
                    .stopAsync()
                    .catch(() => {})
                    .then(() =>
                        soundToUnload.unloadAsync()
                    )
                    .catch(() => {});
            }
        };
    }, [
        fallDurationMs,
        height,
        impactScaleY,
        startDelayMs,
        translateY,
    ]);

    const horizontalBars = [
        0.025,
        0.32,
        0.65,
        0.965,
    ];

    return (
        <Animated.View
            pointerEvents="none"
            style={[
                styles.root,
                {
                    transform: [
                        {
                            translateY,
                        },
                        {
                            scaleY:
                            impactScaleY,
                        },
                    ],
                },
            ]}
        >
            {/!* Вертикальные прутья *!/}
            {barPositions.map(
                (left, index) => (
                    <View
                        key={`vertical-bar-${index}`}
                        style={[
                            styles.verticalBar,
                            {
                                left:
                                    left -
                                    verticalBarWidth /
                                    2,

                                width:
                                verticalBarWidth,
                            },
                        ]}
                    >
                        <View
                            style={
                                styles.verticalBarHighlight
                            }
                        />

                        <View
                            style={
                                styles.verticalBarShadow
                            }
                        />
                    </View>
                )
            )}

            {/!* Горизонтальные перекладины *!/}
            {horizontalBars.map(
                (position, index) => (
                    <View
                        key={`horizontal-bar-${index}`}
                        style={[
                            styles.horizontalBar,
                            {
                                top:
                                    height *
                                    position -
                                    horizontalBarHeight /
                                    2,

                                height:
                                horizontalBarHeight,
                            },
                        ]}
                    >
                        <View
                            style={
                                styles.horizontalBarHighlight
                            }
                        />

                        <View
                            style={
                                styles.horizontalBarShadow
                            }
                        />
                    </View>
                )
            )}

            {/!* Боковые усиленные стойки *!/}
            <View
                style={[
                    styles.sideFrame,
                    {
                        left: 0,
                        width:
                            verticalBarWidth *
                            1.35,
                    },
                ]}
            />

            <View
                style={[
                    styles.sideFrame,
                    {
                        right: 0,
                        width:
                            verticalBarWidth *
                            1.35,
                    },
                ]}
            />
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    root: {
        ...StyleSheet.absoluteFillObject,

        zIndex: 2_000_000,
        elevation: 2_000_000,

        overflow: "visible",
    },

    verticalBar: {
        position: "absolute",

        top: -30,
        bottom: -30,

        backgroundColor: "#252B2F",

        borderWidth: 2,
        borderColor: "#111518",

        borderRadius: 8,

        elevation: 18,

        shadowColor: "#000000",
        shadowOffset: {
            width: 5,
            height: 3,
        },
        shadowOpacity: 0.65,
        shadowRadius: 6,
    },

    verticalBarHighlight: {
        position: "absolute",

        top: 2,
        bottom: 2,
        left: 3,

        width: 3,

        borderRadius: 4,

        backgroundColor:
            "rgba(185, 199, 207, 0.52)",
    },

    verticalBarShadow: {
        position: "absolute",

        top: 2,
        bottom: 2,
        right: 2,

        width: 4,

        borderRadius: 4,

        backgroundColor:
            "rgba(0, 0, 0, 0.5)",
    },

    horizontalBar: {
        position: "absolute",

        left: -20,
        right: -20,

        backgroundColor: "#30373C",

        borderWidth: 2,
        borderColor: "#111518",

        borderRadius: 7,

        elevation: 24,

        shadowColor: "#000000",
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.65,
        shadowRadius: 7,
    },

    horizontalBarHighlight: {
        position: "absolute",

        left: 3,
        right: 3,
        top: 3,

        height: 3,

        borderRadius: 3,

        backgroundColor:
            "rgba(189, 203, 211, 0.48)",
    },

    horizontalBarShadow: {
        position: "absolute",

        left: 3,
        right: 3,
        bottom: 2,

        height: 4,

        borderRadius: 3,

        backgroundColor:
            "rgba(0, 0, 0, 0.55)",
    },

    sideFrame: {
        position: "absolute",

        top: -40,
        bottom: -40,

        backgroundColor: "#1C2125",

        borderWidth: 2,
        borderColor: "#090B0C",

        elevation: 28,

        shadowColor: "#000000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.75,
        shadowRadius: 8,
    },
});*/
