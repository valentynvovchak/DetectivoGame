import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";

interface SVGImageProps{
    Image: any; // SVG компонент
    style: any; // style
}

const { width, height } = Dimensions.get("window");

export default function SVGImage({Image, style}: SVGImageProps) {
    // размер персонажа в зависимости от режима

    return (
        <View>
            <Image style={style}/>
        </View>
    );
}

const styles = StyleSheet.create({});
