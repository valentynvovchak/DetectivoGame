import React from "react";
import { View, Text, Image, StyleSheet, Dimensions, Platform } from "react-native";
import {isSmallScreen, isTablet} from "@/styles/global";

const { width, height } = Dimensions.get("window");

interface SpeechBubbleProps {
    text: string;
    side: "left" | "right" | "center";
    speaker?: string;
    mode?: "small" | "medium" | "large";
}

export default function SpeechBubble({
         text,
         side,
         speaker,
         mode = "medium",
         charMode
     }: SpeechBubbleProps) {
    // размеры пузыря
    const scale = mode === "small" ? 0.6 : mode === "large" ? 1 : 0.8;

    // позиционирование
    const bubbleStyle =
        side === "left"
            ? { left: width * (isTablet ? 0.30 : charMode === "cut" ? 0.4 : 0.28), alignItems: "center" }
            : side === "right"
                ? { right: width * (isTablet ? 0.30 : charMode === "cut" ? 0.4 : 0.28), alignItems: "center" }
                : { alignItems: "center" };

    const textContainerStyle = {
        marginBottom: 10,
        maxWidth: (mode === "small" ? 190 : mode === "medium" ? 250 : 300),
        paddingLeft: 20,
        paddingRight: 15,
        paddingVertical: 5,
        width: width * (mode === "small" ? 0.38 : mode === "medium" ? 0.48 : 0.58),
        justifyContent: "flex-start",
    };

    if (speaker == "Narrator") {
        return (
            <View style={[styles.narrator_container]}>
                <Text style={styles.narratorText}>{text}</Text>
            </View>
        )
    }

    return (
        <View style={[
            styles.container,
            bubbleStyle,
            {
                bottom: charMode === 'cut'
                    ? height * (isTablet ? 0.68 : (Platform.OS === "web" ? 0.62 : 0.645))
                    : height * (isTablet ? 0.78 : (Platform.OS === "web" ? 0.72 : 0.745))
            }
        ]}>
            <Image
                source={require("../assets/ui/прямая речь прямоугольник для игры готовый 1.png")}
                style={[
                    styles.bubbleImage,
                    { transform: [{ scaleX: side === "left" ? scale : -scale }, { scaleY: scale }] },
                ]}
                // resizeMode="stretch"
            />
            <View style={[textContainerStyle]}>
                {/*{speaker && <Text style={styles.speaker}>{speaker}</Text>}*/}
                <Text style={styles.text}>{text}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        // bottom: height * (isTablet ? 0.78 : (Platform.OS === "web" ? 0.72 : 0.745)), // над персонажем
        justifyContent: "center", // выравнивание вниз (а не по центру!)
        alignItems: "center",
        // maxWidth: 300,
        // width: width * 0.65,
        // height: height * 0.2,
    },
    bubbleImage: {
        position: "absolute",
        maxWidth: 300,
        width: width * (isSmallScreen ? 0.55 : 0.60),
        height: height * (isSmallScreen ? 0.2 : 0.2),
        // tintColor: "white",
    },
    // textContainer: {
    //     // transform: "translateY(20)",
    //     marginBottom: 10,
    //     maxWidth: 300,
    //     paddingHorizontal: 20,
    //     paddingVertical: 5,
    //     width: width * 0.58,
    //     justifyContent: "flex-start"
    // },
    speaker: {
        fontWeight: "700",
        color: "#2b2b2b",
        fontSize: 14,
    },
    text: {
        color: "#222",
        fontSize: isSmallScreen ? 13 : isTablet ? 20 : 15,
        lineHeight: isSmallScreen ? 17 : isTablet ? 25 : 20,
    },
    narrator_container: {
        backgroundColor: '#FFEE7D',
        borderStyle: 'solid',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#418AFE',
        paddingVertical: 10,
        paddingHorizontal: 20,
        position: "absolute",
        // bottom: height * (isTablet ? 0.78 : (Platform.OS === "web" ? 0.72 : 0.745)), // над персонажем
        bottom: height * 0.2,
        width: width * 0.9,
        maxWidth: 500,
        justifyContent: "center",
        alignItems: "center",
    },
    narratorText: {
        color: "#222",
        fontSize: isSmallScreen ? 16 : isTablet ? 22 : 17,
        lineHeight: isSmallScreen ? 21 : isTablet ? 27 : 22,
    }
});
