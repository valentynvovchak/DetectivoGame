import React from "react";
import { Image, StyleSheet, View } from "react-native";
import {isTablet} from "@/styles/global";
import {height} from "@/styles/global";

interface CharacterProps {
    mode: "full" | "zoom" | "cut";
    side: "left" | "right" | "center";
    sprite: any;
    isSpeaking?: boolean;
}


export default function CharacterSprite({ mode, side, Sprite, isSpeaking }: CharacterProps) {
    let styles_image = undefined;
    let styles_container = undefined;
    let styles_left = undefined;
    let styles_right = undefined;
    switch (mode) {
        case "full":
            styles_image = styles.image
            styles_container = styles.container
            styles_left = styles.left
            styles_right = styles.right
            break
        case "zoom":
            styles_image = styles.zoom_image
            styles_container = styles.zoom_container
            styles_left = styles.zoom_left
            styles_right = styles.zoom_right
            break
        case "cut":
            styles_image = styles.cut_image
            styles_container = styles.cut_container
            // styles_left = styles.cut_left
            // styles_right = styles.cut_right
            break
    }
    return (
        <View
            style={[
                styles_container,
                side === "left" ? styles_left : side === "right" ? styles_right : styles.center,
            ]}
        >
            <Sprite
                style={[styles_image, !isSpeaking && styles.dimmed]}
                resizeMode="contain"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    // container
    container: {
        position: "absolute",
        // bottom: "20px",
        // bottom: isTablet ? "-15vh" : "-16vh",
        bottom: isTablet ? "-15vh" : "-16vh",
        // bottom: "-15%",
        // maxHeight: '900px',
        // minWidth: '180px',
        width: isTablet ? "63%" : "53%",
        // width: isTablet ? "53%" : "43%",
        // width: "70%",
        height: "100%",
        // height: "100%",
        justifyContent: "center",
    },
    zoom_container: {
        position: "absolute",
        bottom: isTablet ? "-23vh" : "-25vh",
        // width: isTablet ? "63%" : "53%",
        width: isTablet ? "70%" : "60%",
        height: "100%",
        justifyContent: "center",
    },
    cut_container: {
        position: "absolute",
        bottom: 0,
        width: isTablet ? "54%" : "43%",
        height: "100%",
        justifyContent: "flex-end",
    },
    // image
    image: {
        maxWidth: isTablet ? '420px' : '370px',
        maxHeight: isTablet ? height-400 : '700px',
        // maxWidth: '50%',
        // maxHeight: '67%',
        width: "100%",
        height: "100%",
    },
    zoom_image: {
        maxWidth: isTablet ? '520px' : '370px',
        maxHeight: isTablet ? height-300 : '700px',
        width: "100%",
        height: "100%",
    },
    cut_image: {
        maxHeight: '67%',
    },
    left: {
        // left: 0,
        left: "1.5vw",
        alignItems: "flex-start",
    },
    zoom_left: {
        left: isTablet ? "-5vh" : "-8vw",
        alignItems: "flex-start",
    },
    right: {
        // right: 0,
        right: "1.5vw",
        alignItems: "flex-end",
    },
    zoom_right: {
        right: isTablet ? "-5vh" : "-8vw",
        alignItems: "flex-end",
    },
    center: {
        left: "25%",
        alignItems: "center",
    },
    dimmed: {
        opacity: 1, // затемнение неактивного персонажа
    },
});
