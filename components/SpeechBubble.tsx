import React, {useState} from "react";
import {
    View,
    Image,
    ImageBackground,
    StyleSheet,
    Dimensions,
    Platform,
    ImageSourcePropType,
} from "react-native";

import { isSmallScreen, isTablet } from "@/styles/global";
import { GameState } from "@/store/gameStore";
import AppText from "@/components/Common/AppText";
import { SCALE as baseScale } from "@/tools/constants";
import { LinearGradient } from "expo-linear-gradient";
import { RESOURCES } from "@/assets/resources";
import SVGImage from "@/components/small/SVGImage";
import {getSprite} from "@/tools/utils";
import {platform} from "os";

const { width, height } = Dimensions.get("window");
const SCALE = baseScale * 3;

const AVATAR_SIZE = width * 0.22;
const AVATAR_BUBBLE_WIDTH = width * 0.75;
const AVATAR_BUBBLE_HEIGHT = width * 0.28;
const AVATAR_DIALOG_BOTTOM = height * 0.035;

interface SpeechBubbleProps {
    text: string;
    side: "left" | "right" | "center";
    speaker?: string;
    mode?: "small" | "medium" | "large" | "avatar" | "zip" | "dark";
    lang?: GameState["lang"];
    charMode?: string;
    avatarSprite?: string;
    avatarBg?: string;
}

export default function SpeechBubble({
         text,
         side,
         speaker,
         mode = "medium",
         charMode,
         avatarSprite,
         avatarBg
    }: SpeechBubbleProps) {

    const [darkTextHeight, setDarkTextHeight] = useState(0);

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

    if (mode === "avatar") {
        return (
            <View style={styles.avatarDialogRoot}>
                <View style={[styles.avatarBox, {backgroundColor: avatarBg || "#D8423E"}]}>
                    {avatarSprite ? (
                        <View style={styles.avatarSpriteWrap} pointerEvents="none">
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
                    1.42 *
                    width *
                    (isTablet ? 0.3 : charMode === "cut" ? 0.4 : 0.28),
                alignItems: "center" as const,
            }
            : side === "right"
                ? {
                    right:
                        1.42 *
                        width *
                        (isTablet ? 0.3 : charMode === "cut" ? 0.4 : 0.28),
                    alignItems: "center" as const,
                }
                : {
                    alignItems: "center" as const,
                };

    const textContainerStyle = {
        marginBottom: mode === 'zip' ? 0 : mode === 'dark' ? 25 : 10,
        maxWidth: mode === "small" ? 210 : mode === "medium" ? 300 : 375,
        paddingLeft: isTablet ? 25 : 20,
        paddingRight: 15,
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
                                ? 0.62
                                : Platform.OS === "web"
                                    ? 0.62
                                    : 0.645) :
                        mode === "zip" ?
                            height *
                            (isTablet
                                ? 0.65
                                : Platform.OS === "web"
                                    ? 0.68
                                    : 0.705) :
                            height *
                            (isTablet
                                ? 0.72
                                : Platform.OS === "web"
                                    ? 0.72
                                    : 0.745),
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
                                    : mode === "zip" ? 25 : 20,
                            paddingBottom: mode === "zip" ? 40 * SCALE : 0,
                            fontSize: isSmallScreen ? 13 : isTablet ? mode === "zip" ? 26 : 24 : 15,
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
        bottom: AVATAR_DIALOG_BOTTOM,

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

        borderRadius: 28,
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

        paddingLeft: width * 0.065,
        paddingRight: width * 0.03,
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

        fontSize: width * 0.03,
        lineHeight: width * 0.043,

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

    // darkBubbleRoot: {
    //     position: "absolute",
    //     top: height * 0.17,
    //
    //     zIndex: 120,
    //     elevation: 120,
    // },

    // darkBubbleImage: {
    //     minHeight: height * 0.105,
    //
    //     paddingLeft: width * 0.035,
    //     paddingRight: width * 0.035,
    //     paddingTop: height * 0.018,
    //
    //     // важно: место под хвостик картинки
    //     paddingBottom: height * 0.055,
    //
    //     justifyContent: "center",
    // },

    // darkBubbleImageStyle: {
    //     // width: "100%",
    //     // height: "100%",
    // },

    // darkBubbleText: {
    //     color: "#F7EFE4",
    //
    //     fontFamily: "IBMPlexMono-Regular",
    //
    //     fontSize: isSmallScreen ? 12 : isTablet ? 20 : 14,
    //     lineHeight: isSmallScreen ? 16 : isTablet ? 26 : 19,
    //
    //     textAlign: "left",
    //
    //     flexShrink: 1,
    //     flexWrap: "wrap",
    // },

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
});