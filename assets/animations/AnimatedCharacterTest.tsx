import React from "react";

import {
    StyleSheet,
    useWindowDimensions,
    View,
} from "react-native";

import { Image } from "expo-image";

export default function AnimatedCharacterTest() {
    const { width, height } =
        useWindowDimensions();

    /*
     * Пока приблизительные размеры.
     * Наша задача — увидеть персонажа
     * внутри настоящей игровой сцены.
     */
    const characterWidth =
        width;

    const characterHeight =
        height * 0.91;

    return (
        <View
            pointerEvents="none"
            style={[
                styles.container,
                {
                    width: characterWidth,
                    height: characterHeight,

                    /*
                     * Центрируем персонажа.
                     */
                    left:
                        (width -
                            characterWidth) /
                        2,

                    /*
                     * Немного опускаем вниз,
                     * чтобы ноги уходили к краю экрана.
                     */
                    bottom:
                        -height * 0.06,
                },
            ]}
        >
            <Image
                source={require(
                    "../../assets/animations/Anim1_2.webp"
                )}
                style={styles.image}
                contentFit="contain"
                autoplay
                cachePolicy="memory-disk"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",

        justifyContent: "flex-end",
        alignItems: "center",

        overflow: "visible",
    },

    image: {
        width: "100%",
        height: "100%",
    },
});