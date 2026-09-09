import React from "react";
import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";

export default function WebpCharacterTest() {
    return (
        <View style={styles.container}>
            <View style={styles.leftBackground} />
            <View style={styles.rightBackground} />

            <Image
                source={require(
                    "../../assets/animations/Anim1_2.webp"
                )}
                style={styles.animation}
                contentFit="contain"
                autoplay
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        overflow: "hidden",
    },

    leftBackground: {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        width: "50%",
        backgroundColor: "#EF3038",
    },

    rightBackground: {
        position: "absolute",
        top: 0,
        bottom: 0,
        right: 0,
        width: "50%",
        backgroundColor: "#20AE75",
    },

    animation: {
        ...StyleSheet.absoluteFillObject,
    },
});