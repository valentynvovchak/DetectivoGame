import React, { useEffect, useState } from "react";

import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import {
    SafeAreaView,
} from "react-native-safe-area-context";

import {
    VideoView,
    useVideoPlayer,
} from "expo-video";

import { useEvent } from "expo";

const VIDEO = require(
    "../assets/videos/walk_to_car.mp4"
);

export default function VideoTestScreen() {
    const [
        surfaceType,
        setSurfaceType,
    ] = useState<
        "surfaceView" | "textureView"
        >("surfaceView");

    const player =
        useVideoPlayer(
            VIDEO,
            (player) => {
                player.loop = true;
                player.muted = true;
                player.play();
            }
        );

    const { status, error } =
        useEvent(
            player,
            "statusChange",
            {
                status:
                player.status,
                error: null,
            }
        );

    const { isPlaying } =
        useEvent(
            player,
            "playingChange",
            {
                isPlaying:
                player.playing,
            }
        );

    useEffect(() => {
        console.log(
            "🎬 TEST STATUS:",
            status,
            error ?? ""
        );
    }, [
        status,
        error,
    ]);

    useEffect(() => {
        console.log(
            "🎬 TEST PLAYING:",
            isPlaying
        );
    }, [isPlaying]);

    return (
        <SafeAreaView
            style={styles.screen}
        >
            <Text style={styles.title}>
                VIDEO TEST
            </Text>

            <Text style={styles.info}>
                status: {String(status)}
            </Text>

            <Text style={styles.info}>
                playing:{" "}
                {String(isPlaying)}
            </Text>

            <Text style={styles.info}>
                surface: {surfaceType}
            </Text>

            {error ? (
                <Text
                    style={styles.error}
                >
                    {String(error)}
                </Text>
            ) : null}

            <View
                style={
                    styles.videoArea
                }
            >
                <VideoView
                    key={surfaceType}
                    player={player}
                    style={styles.video}
                    contentFit="contain"
                    nativeControls
                    surfaceType={
                        surfaceType
                    }
                    useExoShutter={false}
                />
            </View>

            <View
                style={
                    styles.buttons
                }
            >
                <Pressable
                    style={
                        styles.button
                    }
                    onPress={() => {
                        if (
                            player.playing
                        ) {
                            player.pause();
                        } else {
                            player.play();
                        }
                    }}
                >
                    <Text
                        style={
                            styles.buttonText
                        }
                    >
                        PLAY / PAUSE
                    </Text>
                </Pressable>

                <Pressable
                    style={
                        styles.button
                    }
                    onPress={() => {
                        player.currentTime =
                            0;
                        player.play();
                    }}
                >
                    <Text
                        style={
                            styles.buttonText
                        }
                    >
                        RESTART
                    </Text>
                </Pressable>

                <Pressable
                    style={
                        styles.button
                    }
                    onPress={() => {
                        setSurfaceType(
                            (current) =>
                                current ===
                                "surfaceView"
                                    ? "textureView"
                                    : "surfaceView"
                        );
                    }}
                >
                    <Text
                        style={
                            styles.buttonText
                        }
                    >
                        SWITCH SURFACE
                    </Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}

const styles =
    StyleSheet.create({
        screen: {
            flex: 1,

            backgroundColor:
                "#ff3030",

            padding: 20,
        },

        title: {
            color: "#ffffff",
            fontSize: 28,
            fontWeight: "700",

            marginTop: 20,
            marginBottom: 12,
        },

        info: {
            color: "#ffffff",
            fontSize: 17,
            marginBottom: 5,
        },

        error: {
            color: "#ffff00",
            marginVertical: 10,
        },

        videoArea: {
            flex: 1,

            marginTop: 20,
            marginBottom: 20,

            backgroundColor:
                "#00ff6a",

            borderWidth: 4,
            borderColor:
                "#ffffff",

            overflow: "hidden",
        },

        video: {
            width: "100%",
            height: "100%",
        },

        buttons: {
            gap: 10,

            paddingBottom: 20,
        },

        button: {
            minHeight: 52,

            backgroundColor:
                "#202020",

            borderWidth: 2,
            borderColor:
                "#ffffff",

            alignItems: "center",
            justifyContent:
                "center",

            borderRadius: 8,
        },

        buttonText: {
            color: "#ffffff",
            fontSize: 16,
            fontWeight: "700",
        },
    });