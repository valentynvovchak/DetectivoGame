import React from "react";
import { View, StyleSheet, Dimensions, Platform } from "react-native";
import {isTablet} from "@/styles/global";
import {opacity} from "react-native-reanimated/lib/typescript/Colors";

interface CharacterSpriteProps {
    side: "left" | "right" | "center";
    Sprite: any; // SVG компонент
    isSpeaking?: boolean;
    mode?: "full" | "zoom" | "cut";
}

const { width, height } = Dimensions.get("window");

export default function CharacterSpriteNew({
        side,
        Sprite,
        isSpeaking = false,
        mode = "full",
        heightModifier = 1
    }: CharacterSpriteProps) {
    // размер персонажа в зависимости от режима
    const scale = mode === "zoom" ? 1.1 : mode === "cut" ? 0.8 : 1;

    const spriteWidth = width * heightModifier * (mode === "cut" ? 0.87 : (mode !== "zoom" ? 0.54 : 0.59)) * scale;
    const spriteHeight = height * heightModifier * (mode === "cut" ? 0.83 : 0.8) * scale;

    // позиция персонажа
    const containerStyle =
        side === "left"
            ? { left: width * (mode !== "zoom" ? 0.00 : isTablet ? -0.05 : -0.08) }
            : side === "right"
                ? { right: width * (mode !== "zoom" ? 0.00 : isTablet ? -0.05 : -0.08) }
                : { left: width * 0.29 };

    return (
        <View style={[
            styles.container,
            containerStyle,
            {
                bottom:
                    Platform.OS === "web"
                        ? height * (mode !== "zoom" ? -0.05 : -0.14)
                        : height * (mode !== "zoom" ? -0.04 : -0.13),
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
    },
});
