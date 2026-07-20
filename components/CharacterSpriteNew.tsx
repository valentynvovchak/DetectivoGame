import React from "react";
import { View, StyleSheet, Dimensions, Platform } from "react-native";
import {isSmallScreen, isTablet} from "@/styles/global";

interface CharacterSpriteProps {
    side: "left" | "right" | "center";
    Sprite: any; // SVG компонент
    isSpeaking?: boolean;
    mode?: "full"  | "cut"| "zoom" | "zoom2";
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
