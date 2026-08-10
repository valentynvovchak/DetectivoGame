import React, {useState} from "react";
import {
    View,
    Image,
    ImageBackground,
    StyleSheet,
    Dimensions,
    Platform,
    ImageSourcePropType,
    ViewStyle,
    TextStyle,
    Text,
} from "react-native";

import { isSmallScreen, isTablet } from "@/styles/global";
import { GameState } from "@/store/gameStore";
import AppText from "@/components/Common/AppText";
import { SCALE as baseScale } from "@/tools/constants";
import { LinearGradient } from "expo-linear-gradient";
import { RESOURCES } from "@/assets/resources";
import SVGImage from "@/components/small/SVGImage";
import {getSprite} from "@/tools/utils";

const { width, height } = Dimensions.get("window");
const SCALE = baseScale * 3;

const AVATAR_SIZE = width * 0.22;
const AVATAR_BUBBLE_WIDTH = width * 0.75;
const AVATAR_BUBBLE_HEIGHT = width * 0.28;
// const AVATAR_DIALOG_BOTTOM = height * 0.035;


interface SpeechBubbleProps {
    text: string;
    side: "left" | "right" | "center";
    speaker?: string;
    mode?: "small" | "medium" | "large" | "avatar" | "zip" | "dark" | "explanation" | "bottom";
    lang?: GameState["lang"];
    charMode?: string;
    avatarSprite?: string;
    avatarImage?: string;
    avatarBg?: string;
    avatarPosition: "top" | "bottom";
}

const stripBoldMarkup = (value: string) => {
    return value.replace(/\*\*(.*?)\*\*/g, "$1");
};

const renderBoldText = (value: string) => {
    const parts = value.split(/(\*\*.*?\*\*)/g);

    return parts.map((part, index) => {
        const isBold =
            part.startsWith("**") &&
            part.endsWith("**");

        if (isBold) {
            return (
                <Text
                    key={index}
                    style={{
                        fontFamily: "IBMPlexMono-Bold",
                    }}
                >
                    {part.slice(2, -2)}
                </Text>
            );
        }

        return part;
    });
};

export default function SpeechBubble({
         text,
         side,
         speaker,
         mode = "medium",
         charMode,
         avatarSprite,
         avatarImage,
         avatarBg,
         avatarPosition = "bottom"
    }: SpeechBubbleProps) {

    const [darkTextHeight, setDarkTextHeight] = useState(0);

    const AVATAR_DIALOG_BOTTOM = avatarPosition === "top" ?
        height * 0.82 :
        height * 0.035;

    if (!isSmallScreen) {
        if (mode === "large") {
            mode = "medium"
        } else if (mode === "medium") {
            mode = "small"
        }
    }

    if (speaker === "Narrator" || speaker === "Narrator2" ) {
        return (
            <LinearGradient
                colors={["#CCCCCC", "#CACA99"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }} // сверху вниз
                style={[styles.narratorContainer, {bottom: height * (speaker === "Narrator2" ? 0.4 : 0.15)}]}
                // style={{
                    // alignSelf: "flex-start",
                    // borderRadius: 10,
                    // padding: 6 * SCALE, // ← толщина рамки
                    // marginBottom: 600 * SCALE,
                // }}
            >
                <View style={{backgroundColor: "#385253",paddingVertical: 17, paddingHorizontal: 20, borderRadius: 10}}>
                    <AppText style={styles.narratorText}>{text}</AppText>
                </View>
            </LinearGradient>
        );
    }

    if (speaker === "SidePanel") {
        return (
            <LinearGradient
                colors={["#35AC59", "#7F7F7F"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.sidePanelGradient}
            >
                <View style={styles.sidePanelContainer}>
                    <AppText style={styles.sidePanelText}>{text}</AppText>
                </View>
            </LinearGradient>
        );
    }

    if (mode === "zip") {
        const promptWidth = isTablet
            ? Math.min(width * 0.72, 660)
            : Math.min(width * 0.88, 520);

        const horizontalPosition =
            side === "left"
                ? {
                    left: width * 0.05,
                }
                : side === "right"
                    ? {
                        right: width * 0.05,
                    }
                    : {
                        left: (width - promptWidth) / 2,
                    };

        /*
         * Убираем лишние пробелы, чтобы подсчёт слов
         * работал одинаково для русского и английского.
         */
        const normalizedText =
            typeof text === "string"
                ? text.replace(/\s+/g, " ").trim()
                : "";

        const wordsCount = normalizedText
            .split(" ")
            .filter(Boolean)
            .length;

        /*
         * Короткие фразы показываем крупнее.
         *
         * 1–4 слова  — крупный текст;
         * 5–8 слов  — средний;
         * 9+ слов   — стандартный.
         */
        const isVeryShortText =
            wordsCount <= 4 &&
            normalizedText.length <= 35;

        const isShortText =
            wordsCount <= 8 &&
            normalizedText.length <= 70;

        const promptFontSize = isTablet
            ? isVeryShortText
                ? 26
                : isShortText
                    ? 22
                    : 19
            : isSmallScreen
                ? isVeryShortText
                    ? 17
                    : isShortText
                        ? 15
                        : 13
                : isVeryShortText
                    ? 21
                    : isShortText
                        ? 18
                        : 16;

        const promptLineHeight =
            Math.round(promptFontSize * 1.3);

        const promptBubbleStyle: ViewStyle = {
            paddingHorizontal: 0,
        };

        const promptBubbleTextStyle: TextStyle = {
            fontSize: promptFontSize,
            lineHeight: promptLineHeight,
            textAlign: "center",
        };

        return (
            <View
                pointerEvents="none"
                style={[
                    styles.promptBubbleRoot,
                    horizontalPosition,
                    {
                        width: promptWidth,
                    },
                ]}
            >
                <LinearGradient
                    colors={["#CCCCCC", "#CACA99"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={styles.promptBubbleBorder}
                >
                    <View
                        style={[
                            styles.promptBubble,
                            promptBubbleStyle,
                        ]}
                    >
                        <AppText
                            style={[
                                styles.promptBubbleText,
                                promptBubbleTextStyle,
                            ]}
                            numberOfLines={3}
                            adjustsFontSizeToFit
                            minimumFontScale={0.78}
                        >
                            {normalizedText}
                        </AppText>
                    </View>
                </LinearGradient>
            </View>
        );
    }

    /*if (mode === "bottom") {
        const rawText =
            typeof text === "string"
                ? text
                : "";

        const cleanText = rawText
            .replace(/\*\*(.*?)\*\*!/g, "$1")
            .replace(/\s+/g, " ")
            .trim();

        const wordsCount = cleanText
            .split(" ")
            .filter(Boolean)
            .length;

        /!*
         * Как в дизайне:
         *
         * персонаж слева -> bubble справа от него
         * персонаж справа -> bubble слева от него
         *!/
        const bubbleWidth = isTablet
            ? Math.min(width * 0.42, 360)
            : width * 0.43;

        const horizontalPosition =
            side === "left"
                ? {
                    left: width * 0.31,
                }
                : side === "right"
                    ? {
                        right: width * 0.31,
                    }
                    : {
                        left:
                            (width - bubbleWidth) / 2,
                    };

        /!*
         * Короткие фразы чуть крупнее.
         *!/
        const fontSize = isTablet
            ? wordsCount <= 6
                ? 17
                : 15
            : isSmallScreen
                ? wordsCount <= 6
                    ? 13
                    : 11
                : wordsCount <= 6
                    ? 16
                    : 13;

        const lineHeight =
            Math.round(fontSize * 1.28);

        return (
            <View
                pointerEvents="none"
                style={[
                    styles.bottomBubbleRoot,
                    horizontalPosition,
                    {
                        width: bubbleWidth,
                    },
                ]}
            >
                <View style={styles.bottomBubble}>
                    <Text
                        style={[
                            styles.bottomBubbleText,
                            {
                                fontSize,
                                lineHeight,
                            },
                        ]}
                        numberOfLines={3}
                        adjustsFontSizeToFit
                        minimumFontScale={0.78}
                    >
                        {renderBoldText(rawText)}
                    </Text>

                    {/!* хвост bubble *!/}
                    <View
                        style={[
                            styles.bottomBubbleTailBorder,

                            side === "left"
                                ? styles.bottomBubbleTailLeft
                                : styles.bottomBubbleTailRight,
                        ]}
                    />

                    <View
                        style={[
                            styles.bottomBubbleTailInner,

                            side === "left"
                                ? styles.bottomBubbleTailLeftInner
                                : styles.bottomBubbleTailRightInner,
                        ]}
                    />
                </View>
            </View>
        );
    }*/
    if (mode === "bottom") {
        const rawText =
            typeof text === "string"
                ? text
                : "";

        const cleanText = stripBoldMarkup(rawText)
            .replace(/\s+/g, " ")
            .trim();

        const wordsCount = cleanText
            .split(" ")
            .filter(Boolean)
            .length;

        /*
         * Используем настоящий размер PNG.
         * Никаких bubbleWidth * 0.48.
         */
        const bubbleSource = require(
            "../assets/ui/прямая речь прямоугольник для игры готовый 1.png"
        );

        const nativeBubble = Image.resolveAssetSource(bubbleSource);

        /*
         * Максимальная ширина на экране.
         * Сам PNG сохраняет ОРИГИНАЛЬНЫЕ пропорции.
         */
        const maxBubbleWidth = isTablet
            ? Math.min(width * 0.48, 420)
            : width * 0.48;

        const bubbleScale = Math.min(
            1,
            maxBubbleWidth / nativeBubble?.width
        );

        const bubbleWidth =
            nativeBubble?.width * bubbleScale;

        const bubbleHeight =
            nativeBubble?.height * bubbleScale;

        /*
         * Не прижимаем bubble к персонажу.
         *
         * LEFT:
         * [персонаж]    [bubble]
         *
         * RIGHT:
         * [bubble]    [персонаж]
         */
        const horizontalPosition =
            side === "left"
                ? {
                    left: width * 0.43,
                }
                : side === "right"
                    ? {
                        right: width * 0.43,
                    }
                    : {
                        left:
                            (width - bubbleWidth) / 2,
                    };

        const fontSize = isTablet
            ? wordsCount <= 6
                ? 17
                : 15
            : isSmallScreen
                ? wordsCount <= 6
                    ? 13
                    : 11.5
                : wordsCount <= 6
                    ? 16
                    : 13;

        const lineHeight =
            Math.round(fontSize * 1.28);

        return (
            <View
                pointerEvents="none"
                style={[
                    styles.bottomBubbleRoot,
                    horizontalPosition,
                    {
                        width: bubbleWidth,
                        height: bubbleHeight,
                    },
                ]}
            >
                <ImageBackground
                    source={bubbleSource}
                    resizeMode="contain"
                    style={{
                        width: bubbleWidth,
                        height: bubbleHeight,
                        justifyContent: "center",
                    }}
                    imageStyle={[
                        /*
                         * Для персонажа справа
                         * зеркалим только картинку.
                         */
                        side === "right" && {
                            transform: [
                                {
                                    scaleX: -1,
                                },
                            ],
                        },
                    ]}
                >
                    <View
                        style={[
                            styles.bottomBubbleTextWrap,

                            /*
                             * Очень небольшие padding.
                             * Раньше именно padding сильно
                             * зауживал область текста.
                             */
                            side === "left"
                                ? {
                                    paddingLeft: bubbleWidth * 0.12,
                                    paddingRight: bubbleWidth * 0.07,
                                }
                                : {
                                    paddingLeft: bubbleWidth * 0.07,
                                    paddingRight: bubbleWidth * 0.12,
                                },
                        ]}
                    >
                        <Text
                            style={[
                                styles.bottomBubbleText,
                                {
                                    fontSize,
                                    lineHeight,
                                },
                            ]}
                            numberOfLines={3}
                            adjustsFontSizeToFit
                            minimumFontScale={0.8}
                        >
                            {renderBoldText(rawText)}
                        </Text>
                    </View>
                </ImageBackground>
            </View>
        );
    }

    if (mode === "dark") {
        const darkBubbleWidth = Math.min(width * 0.52, isTablet ? 360 : 280);

        const darkPaddingTop = height * 0.01;
        const darkPaddingBottom = Platform.OS === "web" ? height * 0.06 : height * 0.06;

        const darkBubbleHeight = Math.max(
            Platform.OS === "web" ? height * 0.11 : height * 0.21,
            darkTextHeight + darkPaddingTop + darkPaddingBottom
        );

        const darkBubbleStyle =
            side === "left"
                ? {
                    left: width * 0.45,
                }
                : side === "right"
                    ? {
                        right: width * 0.08,
                    }
                    : {
                        left: width * 0.5 - darkBubbleWidth / 2,
                    };

        return (
            <View
                pointerEvents="none"
                style={[
                    styles.darkBubbleRoot,
                    darkBubbleStyle,
                ]}
            >
                <ImageBackground
                    source={require("../assets/ui/dark_speech_bubble.png")}
                    style={[
                        styles.darkBubbleImage,
                        {
                            width: darkBubbleWidth,
                            height: darkBubbleHeight,
                            paddingTop: darkPaddingTop,
                            paddingBottom: darkPaddingBottom,
                        },
                    ]}
                    imageStyle={styles.darkBubbleImageStyle}
                    resizeMode="stretch"
                >
                    <View
                        onLayout={(e) => {
                            const nextHeight = e.nativeEvent.layout.height;

                            if (Math.abs(nextHeight - darkTextHeight) > 1) {
                                setDarkTextHeight(nextHeight);
                            }
                        }}
                    >
                        <AppText style={styles.darkBubbleText}>
                            {text}
                        </AppText>
                    </View>
                </ImageBackground>
            </View>
        );
    }

    if (mode === "explanation") {
        const isLongExplanation = text.length > 100;

        return (
            <View
                pointerEvents="none"
                style={[
                    styles.explanationBubbleRoot,
                    {
                        top: isLongExplanation
                            ? height * 0.24
                            : height * 0.29,
                    },
                ]}
            >
                <LinearGradient
                    colors={["#666666", "#41B159"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.explanationGradient}
                >
                    <View style={styles.explanationBubble}>
                        <AppText style={styles.explanationBubbleText}>
                            {text}
                        </AppText>
                    </View>
                </LinearGradient>
            </View>
        );
    }

    if (mode === "avatar") {
        const pngSource =
            avatarImage
                ? (RESOURCES as Record<string, ImageSourcePropType>)[avatarImage]
                : null;

        return (
            <View style={[styles.avatarDialogRoot, {bottom: AVATAR_DIALOG_BOTTOM}]}>
                <View
                    style={[
                        styles.avatarBox,
                        {
                            backgroundColor: avatarBg || "#D8423E",
                        },
                    ]}
                >
                    {/* ✅ Сначала пробуем PNG */}
                    {pngSource ? (
                        <Image
                            source={pngSource}
                            style={styles.avatarPng}
                        />
                    ) : avatarSprite ? (
                        /* ✅ Если PNG нет — используем SVG */
                        <View
                            style={styles.avatarSpriteWrap}
                            pointerEvents="none"
                        >
                            <SVGImage
                                Image={getSprite(avatarSprite)}
                                style={styles.avatarSprite}
                                width={180 * SCALE}
                                height={550 * SCALE}
                            />
                        </View>
                    ) : (
                        <View style={styles.avatarFallback} />
                    )}
                </View>

                <ImageBackground
                    source={require("../assets/ui/bubble_avatar.png")}
                    style={styles.avatarBubble}
                    imageStyle={styles.avatarBubbleImage}
                    resizeMode="stretch"
                >
                    <AppText style={styles.avatarBubbleText}>
                        {text}
                    </AppText>
                </ImageBackground>
            </View>
        );
    }

    const bubbleScale = mode === "small" ? 0.6 : mode === "large" ? 1 : mode === "zip" ? !isSmallScreen ? 1.2 : 1.35 : 0.8;

    const bubbleStyle =
        side === "left"
            ? {
                left:
                    1.52 *
                    width *
                    (isTablet ? 0.3 : charMode === "cut" ? 0.28 : 0.28),
                alignItems: "center" as const,
            }
            : side === "right"
                ? {
                    right:
                        1.52 *
                        width *
                        (isTablet ? 0.3 : charMode === "cut" ? 0.28 : 0.28),
                    alignItems: "center" as const,
                }
                : {
                    alignItems: "center" as const,
                };

    const textContainerStyle = {
        marginBottom: mode === 'zip' ? 0 : mode === 'dark' ? 25 : 10,
        maxWidth: mode === "small" ? 210 : mode === "medium" ? 300 : 375,
        paddingLeft: isTablet ? 25 : 20,
        paddingRight: 10,
        paddingVertical: 5,
        width:
            width *
            (mode === "small" ? 0.38 : mode === "medium" ? 0.48 : 0.58),
        justifyContent: "flex-start" as const,
    };

    return (
        <View
            style={[
                styles.container,
                bubbleStyle,
                {
                    bottom:
                        charMode === "cut" ?
                            height *
                            (isTablet
                                ? 0.72
                                : Platform.OS === "web"
                                    ? 0.72
                                    : 0.745) :
                        mode === "zip" ?
                            height *
                            (isTablet
                                ? 0.65
                                : Platform.OS === "web"
                                    ? 0.68
                                    : 0.705) :
                        charMode === "zoom" ?
                            height *
                            (isTablet
                                ? 0.78
                                : Platform.OS === "web"
                                    ? 0.78
                                    : 0.805) :
                            height *
                            (isTablet
                                ? 0.76
                                : Platform.OS === "web"
                                    ? 0.76
                                    : 0.785),

                },
            ]}
        >
            <Image
                source={
                    mode === "zip" ?
                        require("../assets/ui/zip_speech_bubble.png") :
                    require("../assets/ui/прямая речь прямоугольник для игры готовый 1.png")
                }
                style={[
                    styles.bubbleImage,
                    {
                        transform: [
                            { scaleX: (side === "left" || mode === "zip") ? bubbleScale : -bubbleScale },
                            { scaleY: bubbleScale },
                        ],
                        // height: (isTablet && mode === "zip") ? height * 0.215 : height * 0.2,
                        height: (!isSmallScreen && mode === "zip") ? height * 0.25 : height * 0.2,
                        width: width * ( mode === "dark" ? (isSmallScreen ? 0.70 : 0.65) : (isSmallScreen ? 0.55 : 0.6)),
                    },
                ]}
            />

            <View style={textContainerStyle}>
                <AppText
                    style={[
                        styles.text,
                        {
                            lineHeight: isSmallScreen
                                ?  mode === "zip" ? 20 : 17
                                : isTablet
                                    ? mode === "zip" ? 37 : 30
                                    : mode === "zip" ? 25 : 16,
                            paddingBottom: mode === "zip" ? 40 * SCALE : 0,
                            fontSize: isSmallScreen ? 13 : isTablet ? mode === "zip" ? 26 : 24 : 13,
                            color: "#222",
                        },
                    ]}
                >
                    {text}
                </AppText>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 20,
        elevation: 20,
    },

    bubbleImage: {
        position: "absolute",
        maxWidth: 400,
        // height: mode === "zip" ? height * 0.24 : height * 0.2,
    },

    text: {
        lineHeight: isSmallScreen ? 17 : isTablet ? 30 : 20,
    },

    narratorContainer: {
        zIndex: 1,
        elevation: 1,
        borderRadius: 12,
        // borderWidth: 1,
        // borderColor: "#418AFE",
        padding: 2,
        marginHorizontal: 20,
        position: "absolute",
        // width: width * 0.9,
        maxWidth: 500,
        justifyContent: "center",
        alignItems: "center",
    },

    narratorText: {
        color: "#fff",
        fontSize: isSmallScreen ? 16 : isTablet ? 22 : 17,
        lineHeight: isSmallScreen ? 21 : isTablet ? 27 : 22,
    },

    sidePanelGradient: {
        alignSelf: "flex-start",
        borderRadius: 3,
        padding: 2,
    },

    sidePanelContainer: {
        backgroundColor: "rgba(45, 70, 70, 0.9)",
        paddingVertical: 46 * SCALE / 3,
        paddingBottom: 40 * SCALE / 3,
        paddingHorizontal: 40 * SCALE / 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 6,
        elevation: 6,
        width: "53%",
    },

    sidePanelText: {
        color: "#EAFBF6",
        fontSize: 49 * SCALE / 3,
        lineHeight: 60 * SCALE / 3,
        textShadowColor: "rgba(0,0,0,0.4)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },

    avatarDialogRoot: {
        position: "absolute",

        left: width * 0.03,

        flexDirection: "row",
        alignItems: "center",

        zIndex: 100,
        elevation: 100,
    },

    avatarBox: {
        borderColor: '#CB7272',
        borderWidth: 2,
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,

        borderRadius: 16,
        // backgroundColor: "#D8423E",
        // borderWidth: 2,
        // borderColor: "#D8423E",

        overflow: "hidden",
        // marginRight: width * 0.025,

        alignItems: "center",
        justifyContent: "center",

        zIndex: 101,
        elevation: 101,
    },

    avatarImage: {
        // width: "100%",
        // height: "100%",
    },

    avatarFallback: {
        width: "100%",
        height: "100%",
        backgroundColor: "#D8423E",
    },

    avatarBubble: {
        width: AVATAR_BUBBLE_WIDTH,
        height: AVATAR_BUBBLE_HEIGHT,

        paddingLeft: width * 0.075,
        paddingRight: width * 0.032,
        paddingTop: height * 0.012,
        paddingBottom: height * 0.025,

        justifyContent: "center",

        zIndex: 101,
        elevation: 101,
    },

    avatarBubbleImage: {
        // width: "100%",
        // height: "100%",
    },

    avatarBubbleText: {
        color: "#1F2430",

        fontSize: width * 0.031,
        lineHeight: width * 0.04,

        fontFamily: "IBMPlexMono-Regular",
    },

    avatarSpriteWrap: {

    },

    avatarSprite: {
        // width: 200 * SCALE,
        // height: 600 * SCALE,
        // transform: [{ scale: SCALE * 0.35 }, { translateY: 810 * SCALE }, { translateX: 6 * SCALE }], //, { translateY: 2000 * SCALE }
        transform: [{ translateY: 183 * SCALE }, { translateX: 2 * SCALE }], //, { translateY: 2000 * SCALE }
    },

    darkBubbleRoot: {
        position: "absolute",
        top: height * 0.17,

        zIndex: 120,
        elevation: 120,
    },

    darkBubbleImage: {
        paddingLeft: width * 0.035,
        paddingRight: width * 0.035,

        justifyContent: "center",
        overflow: "visible",
    },

    darkBubbleImageStyle: {
        // специально пусто
        // НЕ ставить width: "100%" и height: "100%" для Android
    },

    darkBubbleText: {
        color: "#F7EFE4",

        fontFamily: "IBMPlexMono-Regular",

        fontSize: isSmallScreen ? 12 : isTablet ? 20 : 14,
        lineHeight: isSmallScreen ? 16 : isTablet ? 26 : 19,

        textAlign: "left",

        flexShrink: 1,
        flexWrap: "wrap",
    },

    explanationBubbleRoot: {
        position: "absolute",

        left: 0,
        right: 0,

        alignItems: "center",

        zIndex: 125,
        elevation: 125,
    },

    explanationGradient: {
        width: isTablet
            ? Math.min(width * 0.82, 620)
            : Math.min(width * 0.88, 460),

        padding: isTablet ? 3 : 2,

        borderRadius: isTablet ? 17 : 14,

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.16,
        shadowRadius: 3,

        elevation: 5,
    },

    explanationBubble: {
        width: "100%",

        backgroundColor: "rgba(244, 244, 240, 0.97)",

        borderRadius: isTablet ? 14 : 11,

        paddingHorizontal: isTablet ? 22 : 14,
        paddingVertical: isTablet ? 16 : 11,

        minHeight: isTablet ? 70 : 46,

        justifyContent: "center",
    },

    explanationBubbleText: {
        width: "100%",

        color: "#424242",

        fontFamily: "IBMPlexMono-Regular",

        fontSize: isTablet
            ? 21
            : isSmallScreen
                ? 15
                : 18,

        lineHeight: isTablet
            ? 27
            : isSmallScreen
                ? 19
                : 23,

        textAlign: "center",

        flexShrink: 1,
    },
    avatarPng: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },

    promptBubbleRoot: {
        position: "absolute",

        top: isTablet
            ? height * 0.205
            : height * 0.22,

        zIndex: 120,
        elevation: 120,
    },

    promptBubbleBorder: {
        width: "100%",
        padding: isTablet ? 3 : 2,
        borderRadius: isTablet ? 8 : 6,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.25,
        shadowRadius: 5,
        elevation: 6,
    },

    promptBubble: {
        width: "100%",
        minHeight: isTablet ? 90 : 68,
        backgroundColor: "rgba(48, 76, 74, 0.97)",
        borderRadius: isTablet ? 6 : 4,
        paddingHorizontal: isTablet ? 22 : 15,
        // paddingVertical: isTablet ? 16 : 12,
        justifyContent: "center",
    },

    promptBubbleText: {
        width: "100%",
        color: "#F7EFE4",
        fontFamily: "IBMPlexMono-Regular",
        fontSize: isTablet
            ? 18
            : isSmallScreen
                ? 12
                : 15,

        lineHeight: isTablet
            ? 24
            : isSmallScreen
                ? 17
                : 21,
        textAlign: "center",
        flexShrink: 1,
    },



    bottomBubbleImage: {
        width: "100%",

        /*
         * Не фиксируем огромную высоту.
         * Bubble остаётся компактным.
         */
        minHeight: isTablet ? 88 : 72,

        justifyContent: "center",
    },

    bottomBubbleImageStyle: {
        borderRadius: 8,
    },

    bottomBubble: {
        position: "relative",

        width: "100%",
        minHeight: isTablet ? 88 : 72,

        backgroundColor: "#EEF7FF",

        borderWidth: 2,
        borderColor: "#5D86C8",

        borderRadius: 14,

        paddingHorizontal: isTablet ? 17 : 13,
        paddingVertical: isTablet ? 12 : 9,

        justifyContent: "center",
        alignItems: "center",

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.16,
        shadowRadius: 3,

        elevation: 4,
    },


    /*
     * Внешний синий треугольник.
     */
    bottomBubbleTailBorder: {
        position: "absolute",

        bottom: -20,

        width: 0,
        height: 0,

        borderLeftWidth: 15,
        borderRightWidth: 15,
        borderTopWidth: 20,

        borderLeftColor: "transparent",
        borderRightColor: "transparent",
        borderTopColor: "#5D86C8",
    },

    /*
     * Внутренний светлый треугольник.
     * Накладывается поверх синего.
     */
    bottomBubbleTailInner: {
        position: "absolute",

        bottom: -16,

        width: 0,
        height: 0,

        borderLeftWidth: 12,
        borderRightWidth: 12,
        borderTopWidth: 17,

        borderLeftColor: "transparent",
        borderRightColor: "transparent",
        borderTopColor: "#EEF7FF",
    },

    /*
     * Персонаж слева:
     * хвост находится слева у bubble.
     */
    bottomBubbleTailLeft: {
        left: 18,
    },

    bottomBubbleTailLeftInner: {
        left: 21,
    },

    /*
     * Персонаж справа:
     * хвост находится справа.
     */
    bottomBubbleTailRight: {
        right: 18,
    },

    bottomBubbleTailRightInner: {
        right: 21,
    },

    bottomBubbleRoot: {
        position: "absolute",

        bottom: height * 0.145,

        zIndex: 90,
        elevation: 90,
    },

    bottomBubbleTextWrap: {
        width: "100%",
        height: "100%",

        paddingTop: "8%",
        paddingBottom: "15%",

        justifyContent: "center",
    },

    bottomBubbleText: {
        width: "100%",

        color: "#222",

        fontFamily: "IBMPlexMono-Regular",

        textAlign: "left",

        flexShrink: 1,
    },
});