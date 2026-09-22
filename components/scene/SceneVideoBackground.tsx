import React from "react";

import {
    StyleSheet,
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
        <VideoView
            pointerEvents="none"
            player={player}
            style={StyleSheet.absoluteFillObject}
            contentFit="cover"
            nativeControls={false}

            /*
             * На Android это надёжнее,
             * когда поверх видео находятся
             * персонажи, баблы и UI.
             */
            surfaceType="textureView"
        />
    );
}