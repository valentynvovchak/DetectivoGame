import React from "react";
import { View, StyleSheet } from "react-native";

interface SVGImageProps {
    Image: any;
    width?: number;
    height?: number;
    style?: any;
}

export default function SVGImage({
         Image,
         width,
         height,
         style,
     }: SVGImageProps) {
    return (
        <View pointerEvents="none">
            <Image
                {...(width ? { width } : {})}
                {...(height ? { height } : {})}
                style={style}
                // preserveAspectRatio="xMidYMid meet"
            />
        </View>
    );
}

const styles = StyleSheet.create({

});