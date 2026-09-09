import React from "react";

import {
    StyleSheet,
    View,
} from "react-native";

import {
    useVideoPlayer,
    VideoView,
} from "expo-video";

const animationSource = require(
    "../../assets/animations/Anim1_2.webm"
);

export default function WebmCharacterTest() {
    const player = useVideoPlayer(
        animationSource,
        (videoPlayer) => {
            videoPlayer.loop = true;
            videoPlayer.muted = true;
            videoPlayer.play();
        }
    );

    return (
        <View
            pointerEvents="none"
            style={styles.container}
        >
            {/*
             * Два ярких цвета нужны только для проверки:
             * если прозрачность работает, они будут видны
             * сквозь пустые области видео.
             */}
            <View style={styles.leftBackground} />
            <View style={styles.rightBackground} />

            <VideoView
                player={player}
                style={styles.video}
                nativeControls={false}
                contentFit="contain"

                /*
                 * На Android TextureView обычно лучше
                 * подходит для наложения видео поверх
                 * других React Native элементов.
                 */
                surfaceType="textureView"

                /*
                 * Не показываем чёрную заглушку ExoPlayer
                 * перед первым кадром.
                 */
                useExoShutter={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,

        overflow: "hidden",

        zIndex: 999999,
        elevation: 999999,
    },

    leftBackground: {
        position: "absolute",

        top: 0,
        bottom: 0,
        left: 0,

        width: "50%",

        backgroundColor: "#E53333",
    },

    rightBackground: {
        position: "absolute",

        top: 0,
        bottom: 0,
        right: 0,

        width: "50%",

        backgroundColor: "#26A96C",
    },

    video: {
        ...StyleSheet.absoluteFillObject,

        backgroundColor: "transparent",
    },
});