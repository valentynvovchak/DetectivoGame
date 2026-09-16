import React from "react";

import {
    StyleSheet,
    View,
    useWindowDimensions,
} from "react-native";

interface CharacterSpriteProps {
    side: "left" | "right" | "center";

    Sprite: any;

    isSpeaking?: boolean;

    mode?:
        | "full"
        | "cut"
        | "zoom"
        | "zoom2"
        | "zoom3"
        | "bottom";

    heightModifier?: number;

    yModifier?: number;

    proofResult?: boolean;
}

type CharacterMode =
    NonNullable<CharacterSpriteProps["mode"]>;

type ModeConfig = {
    height: number;
    bottom: number;
    sideOffset: number;
};

const DESIGN_WIDTH = 390;
const DESIGN_HEIGHT = 844;

/**
 * Все числа здесь относятся к одному
 * виртуальному макету 390x844.
 *
 * Никаких отдельных настроек
 * Android / iOS / tablet.
 */
const MODE_CONFIG: Record<
    CharacterMode,
    ModeConfig
    > = {
    full: {
        height: 600,
        bottom: 0,
        sideOffset: -18,
    },

    cut: {
        height: 690,
        bottom: -55,
        sideOffset: -24,
    },

    zoom: {
        height: 760,
        bottom: -90,
        sideOffset: -30,
    },

    zoom2: {
        height: 720,
        bottom: -75,
        sideOffset: -26,
    },

    zoom3: {
        height: 780,
        bottom: -100,
        sideOffset: -30,
    },

    bottom: {
        height: 620,
        bottom: -220,
        sideOffset: -20,
    },
};

export default function CharacterSpriteNew({
                                               side,
                                               Sprite,
                                               isSpeaking = false,
                                               mode = "full",
                                               heightModifier = 1,
                                               yModifier = 0,
                                               proofResult = false,
                                           }: CharacterSpriteProps) {
    const {
        width: screenWidth,
        height: screenHeight,
    } = useWindowDimensions();

    const resolvedMode: CharacterMode =
        proofResult &&
        (
            mode === "cut" ||
            mode === "zoom"
        )
            ? "zoom2"
            : mode;

    const config =
        MODE_CONFIG[resolvedMode];

    /**
     * Главное:
     *
     * один scale для всей геометрии.
     *
     * На планшете ширина сама по себе
     * не сделает персонажа огромным.
     */
    const scale = Math.min(
        screenWidth / DESIGN_WIDTH,
        screenHeight / DESIGN_HEIGHT
    );

    const characterHeight =
        config.height *
        scale *
        heightModifier;

    /**
     * View занимает ширину сцены.
     * Сам SVG внутри сохраняет
     * свою настоящую пропорцию.
     */
    const characterViewportWidth =
        screenWidth;

    const yOffset =
        screenHeight * yModifier;

    const bottom =
        config.bottom * scale -
        yOffset;

    const sideOffset =
        config.sideOffset * scale;

    const preserveAspectRatio =
        side === "left"
            ? "xMinYMax meet"
            : side === "right"
                ? "xMaxYMax meet"
                : "xMidYMax meet";

    const horizontalStyle =
        side === "left"
            ? {
                left: sideOffset,
            }
            : side === "right"
                ? {
                    right: sideOffset,
                }
                : {
                    left: 0,
                };

    return (
        <View
            pointerEvents="none"
            style={[
                styles.container,

                horizontalStyle,

                {
                    width:
                    characterViewportWidth,

                    height:
                    characterHeight,

                    bottom,
                },
            ]}
        >
            <Sprite
                width={
                    characterViewportWidth
                }
                height={
                    characterHeight
                }
                preserveAspectRatio={
                    preserveAspectRatio
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",

        overflow: "visible",

        zIndex: 40,
        elevation: 40,
    },
});

/*
import React from "react";
import {
    View,
    StyleSheet,
    Platform,
    useWindowDimensions,
} from "react-native";

import {
    isSmallScreen,
    isTablet,
} from "@/styles/global";

interface CharacterSpriteProps {
    side: "left" | "right" | "center";

    Sprite: any;

    isSpeaking?: boolean;

    mode?:
        | "full"
        | "cut"
        | "zoom"
        | "zoom2"
        | "zoom3"
        | "bottom";

    /!*
     * Изменяет общий размер персонажа.
     *
     * 1 — обычный размер
     * 1.1 — увеличить на 10%
     * 0.9 — уменьшить на 10%
     *!/
    heightModifier?: number;

    /!*
     * Смещение персонажа по вертикали.
     *
     * Положительное значение опускает вниз:
     * 0.05 = вниз на 5% высоты экрана.
     *
     * Отрицательное значение поднимает:
     * -0.05 = вверх на 5% высоты экрана.
     *!/
    yModifier?: number;

    proofResult?: boolean;
}

export default function CharacterSpriteNew({
                                               side,
                                               Sprite,
                                               isSpeaking = false,
                                               mode = "full",
                                               heightModifier = 1,
                                               yModifier = 0,
                                               proofResult = false,
                                           }: CharacterSpriteProps) {
    const { width, height } =
        useWindowDimensions();

    const resolvedMode =
        proofResult &&
        !isSmallScreen &&
        (mode === "cut" || mode === "zoom")
            ? "zoom2"
            : mode;

    /!*
     * Положительное значение должно опускать
     * персонажа вниз, поэтому уменьшаем bottom.
     *!/
    const yOffset = height * yModifier;

    if (resolvedMode === "bottom") {
        const bottomSpriteWidth =
            width * 0.72 * heightModifier;

        const bottomSpriteHeight =
            height * 0.68 * heightModifier;

        const horizontalPosition =
            side === "left"
                ? {
                    left: -width * 0.055,
                }
                : side === "right"
                    ? {
                        right: -width * 0.055,
                    }
                    : {
                        left:
                            (width -
                                bottomSpriteWidth) /
                            2,
                    };

        return (
            <View
                pointerEvents="none"
                style={[
                    styles.container,
                    horizontalPosition,
                    {
                        /!*
                         * Базовое положение:
                         * -height * 0.34
                         *
                         * yModifier дополнительно
                         * опускает или поднимает спрайт.
                         *!/
                        bottom:
                            -height * 0.34 -
                            yOffset,

                        width: bottomSpriteWidth,
                        height: bottomSpriteHeight,

                        zIndex: 40,
                        elevation: 40,
                    },
                ]}
            >
                <Sprite
                    width={bottomSpriteWidth}
                    height={bottomSpriteHeight}
                    style={[
                        !isSpeaking &&
                        styles.dimmed,
                    ]}
                />
            </View>
        );
    }

    const scale =
        resolvedMode === "zoom"
            ? 1.25
            : resolvedMode === "cut"
                ? 0.81
                : resolvedMode === "zoom2"
                    ? 1.15
                    : resolvedMode === "zoom3"
                        ? 1.25
                        : 1;

    const spriteWidth =
        1.1 *
        width *
        heightModifier *
        (resolvedMode === "cut"
            ? 0.9
            : resolvedMode !== "zoom"
                ? 0.54
                : 0.59) *
        scale;

    const spriteHeight =
        1.1 *
        height *
        heightModifier *
        (resolvedMode === "cut"
            ? height > 900
                ? 0.85
                : 0.9
            : height > 900
                ? 0.75
                : 0.79) *
        scale;

    const horizontalPosition =
        side === "left"
            ? {
                left:
                    width *
                    (resolvedMode !== "zoom"
                        ? 0
                        : isTablet
                            ? -0.01
                            : -0.02),
            }
            : side === "right"
                ? {
                    right:
                        width *
                        (resolvedMode !== "zoom"
                            ? 0
                            : isTablet
                                ? -0.01
                                : -0.02),
                }
                : {
                    left: "50%" as const,

                    /!*
                     * Вместо translateX: "-45%".
                     * Числовое значение стабильнее
                     * работает на Android.
                     *!/
                    transform: [
                        {
                            translateX:
                                -spriteWidth * 0.45,
                        },
                    ],
                };

    const baseBottom =
        Platform.OS === "web"
            ? height *
            (resolvedMode !== "zoom"
                ? resolvedMode === "zoom2"
                    ? 6.2 * -0.05
                    : resolvedMode === "zoom3"
                        ? 6.8 * -0.05
                        : -0.09
                : -0.29)
            : height *
            (resolvedMode !== "zoom"
                ? resolvedMode === "zoom2"
                    ? 7.4 * -0.04
                    : resolvedMode === "zoom3"
                        ? 7.8 * -0.04
                        : -0.08
                : -0.28);

    return (
        <View
            pointerEvents="none"
            style={[
                styles.container,
                horizontalPosition,
                {
                    /!*
                     * Положительный yModifier
                     * опускает персонажа.
                     *!/
                    bottom:
                        baseBottom - yOffset,
                },
            ]}
        >
            <Sprite
                width={spriteWidth}
                height={spriteHeight}
                style={[
                    !isSpeaking &&
                    styles.dimmed,
                ]}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        justifyContent: "flex-end",
    },

    dimmed: {
        opacity: 1,
    },
});

/!*
import React from "react";
import { View, StyleSheet, Dimensions, Platform } from "react-native";
import {isSmallScreen, isTablet} from "@/styles/global";

interface CharacterSpriteProps {
    side: "left" | "right" | "center";
    Sprite: any; // SVG компонент
    isSpeaking?: boolean;
    mode?: "full"  | "cut"| "zoom" | "zoom2" | "bottom";
}

const { width, height } = Dimensions.get("window");

export default function CharacterSpriteNew({
        side,
        Sprite,
        isSpeaking = false,
        mode = "full",
        heightModifier = 1,
        proofResult
    }: CharacterSpriteProps) {

    if (proofResult && !isSmallScreen && (mode === 'cut' || mode === 'zoom')) {
        mode = 'zoom2'
    }

    if (mode === "bottom") {
        /!*
         * Большой персонаж.
         * Нижняя часть специально уходит за границу экрана.
         * Экран сам её обрежет.
         *!/

        const bottomSpriteWidth =
            width * 0.72 * heightModifier;

        const bottomSpriteHeight =
            height * 0.68 * heightModifier;

        const horizontalPosition =
            side === "left"
                ? {
                    left: -width * 0.055,
                }
                : side === "right"
                    ? {
                        right: -width * 0.055,
                    }
                    : {
                        left:
                            (width - bottomSpriteWidth) / 2,
                    };

        return (
            <View
                pointerEvents="none"
                style={[
                    styles.container,
                    horizontalPosition,
                    {
                        /!*
                         * Вот это и создаёт crop снизу.
                         *
                         * НЕ используем overflow:hidden.
                         *!/
                        bottom: -height * 0.34,

                        width: bottomSpriteWidth,
                        height: bottomSpriteHeight,

                        zIndex: 40,
                        elevation: 40,
                    },
                ]}
            >
                <Sprite
                    width={bottomSpriteWidth}
                    height={bottomSpriteHeight}
                    style={[
                        !isSpeaking && styles.dimmed,
                    ]}
                />
            </View>
        );
    }

    // размер персонажа в зависимости от режима
    // const scale = mode === "zoom" ? 1.1 : mode === "cut" ? 0.8 : mode === "zoom2" ? 1.15 : 1;
    const scale = mode === "zoom" ? 1.25 : mode === "cut" ? 0.81 : mode === "zoom2" ? 1.15 : 1;

    const spriteWidth = 1.1 * width * heightModifier * (mode === "cut" ? 0.9 : (mode !== "zoom" ? 0.54 : 0.59)) * scale;
    const spriteHeight = 1.1 * height * heightModifier * (mode === "cut" ? height > 900 ? 0.85 : 0.9 : height > 900 ? 0.75 : 0.79) * scale;

    // позиция персонажа
    const containerStyle =
        side === "left"
            // ? { left: width * (mode !== "zoom" ? 0.00 : isTablet ? -0.05 : -0.08) }
            ? { left: width * (mode !== "zoom" ? 0.00 : isTablet ? -0.01 : -0.02) }
            : side === "right"
                // ? { right: width * (mode !== "zoom" ? 0.00 : isTablet ? -0.05 : -0.08) }  // * 0.4
                ? { right: width * (mode !== "zoom" ? 0.00 : isTablet ? -0.01 : -0.02) }  // * 0.4
                : { left: "50%", transform: [{translateX: "-45%"}] };

    return (
        <View style={[
            styles.container,
            containerStyle,
            {
                bottom:
                    Platform.OS === "web"
                        // ? height * (mode !== "zoom" ? mode === "zoom2" ? 6.2 * -0.05 : mode === "zoom3" ? 6.8 * -0.05 : -0.05 : -0.14)
                        // : height * (mode !== "zoom" ? mode === "zoom2" ? 7.4 * -0.04 : mode === "zoom3" ? 7.8 * -0.04 : -0.04 : -0.13),
                        ? height * (mode !== "zoom" ? mode === "zoom2" ? 6.2 * -0.05 : mode === "zoom3" ? 6.8 * -0.05 : -0.09 : -0.29)
                        : height * (mode !== "zoom" ? mode === "zoom2" ? 7.4 * -0.04 : mode === "zoom3" ? 7.8 * -0.04 : -0.08 : -0.28),
            },
        ]}>
            <Sprite
                width={spriteWidth}
                height={spriteHeight}
                style={[!isSpeaking && styles.dimmed]}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        justifyContent: "flex-end",
    },
    dimmed: {
        opacity: 1,
    }
});
*!/
*/
