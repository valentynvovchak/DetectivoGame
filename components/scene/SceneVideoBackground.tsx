import React from "react";

import {
    StyleSheet,
    View,
} from "react-native";

import {
    VideoView,
    useVideoPlayer,
} from "expo-video";

type Props = {
    source: number;
};

export default function SceneVideoBackground({
                                                 source,
                                             }: Props) {
    const player = useVideoPlayer(
        source,
        (player) => {
            player.loop = true;
            player.muted = true;
            player.play();
        }
    );

    return (
        <View
            pointerEvents="none"
            collapsable={false}
            style={styles.layer}
        >
            <VideoView
                player={player}
                style={styles.video}
                contentFit="cover"
                nativeControls={false}
                surfaceType="textureView"
                useExoShutter={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    layer: {
        position: "absolute",

        top: 0,
        left: 0,
        right: 0,
        bottom: 0,

        overflow: "hidden",
    },

    video: {
        width: "100%",
        height: "100%",
    },
});