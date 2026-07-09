import React from "react";
import { Text, TextProps, TextStyle, StyleProp } from "react-native";

type FontWeightMode = "regular" | "bold";

interface AppTextProps extends TextProps {
    weight?: FontWeightMode;
    style?: StyleProp<TextStyle>;
}

export default function AppText({
        weight = "regular",
        style,
        children,
        ...props
    }: AppTextProps) {
    const fontFamily = weight === "bold" ? "IBMPlexMono-Bold" : "IBMPlexMono-Regular";

    return (
        <Text
            {...props}
            style={[{ fontFamily }, style]}
        >
            {children}
        </Text>
    );
}