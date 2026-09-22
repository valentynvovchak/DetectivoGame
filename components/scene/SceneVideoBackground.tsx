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
            style={styles.video}
            contentFit="cover"
            nativeControls={false}

            /*
             * ВАЖНО:
             *
             * textureView у нас:
             * player = playing,
             * но изображение не выводится.
             *
             * Поэтому используем стандартный
             * Android SurfaceView.
             */
            surfaceType="surfaceView"

            /*
             * Не показываем системную заглушку
             * ExoPlayer перед первым кадром.
             */
            useExoShutter={false}
        />
    );
}

const styles = StyleSheet.create({
    video: {
        ...StyleSheet.absoluteFillObject,
    },
});