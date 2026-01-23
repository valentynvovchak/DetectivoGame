import React, { useRef } from "react";
import {
    TouchableOpacity,
    Image,
    StyleSheet,
    ImageBackground,
    Animated,
    PanResponder,
    Dimensions,
    View,
    Text
} from "react-native";
import { getBackground } from "@/tools/utils";
import { useGameStore } from "@/store/gameStore";
import { router } from "expo-router";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

// Размер карты
const MAP_W = SCREEN_W * 1.4;
const MAP_H = SCREEN_H * 1.4;

// Границы движения
const MIN_X = SCREEN_W - MAP_W;
const MAX_X = 0;
const MIN_Y = SCREEN_H - MAP_H;
const MAX_Y = 0;

// 🔒 clamp helper
const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max);

export default function WorldMap() {
    const { mapLocations, visitLocation, changeScene, lang } = useGameStore();

    const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
    const last = useRef({ x: 0, y: 0 });

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: () => true,

            onPanResponderMove: (_, gesture) => {
                const x = clamp(last.current.x + gesture.dx, MIN_X, MAX_X);
                const y = clamp(last.current.y + gesture.dy, MIN_Y, MAX_Y);
                pan.setValue({ x, y });
            },

            onPanResponderRelease: () => {
                pan.flattenOffset();
                last.current = {
                    x: pan.x._value,
                    y: pan.y._value,
                };
            },
        })
    ).current;

    return (
        <View style={styles.root}>
            {/* ❌ КНОПКА ЗАКРЫТИЯ */}
            <TouchableOpacity
                style={styles.closeButton}
                onPress={() => router.back()}
                activeOpacity={0.85}
            >
                <Image
                    source={require("../assets/icons/icon_close.png")}
                    style={styles.closeIcon}
                />
            </TouchableOpacity>

            {/* 🗺️ DRAG-КАРТА */}
            <Animated.View
                {...panResponder.panHandlers}
                style={[
                    styles.mapWrapper,
                    {
                        transform: pan.getTranslateTransform(),
                        width: MAP_W,
                        height: MAP_H,
                    },
                ]}
            >
                <ImageBackground
                    source={getBackground("kanagava_kim_city_map")}
                    style={{ width: MAP_W, height: MAP_H }}
                    resizeMode="cover"
                >
                    {Object.entries(mapLocations).map(([id, loc]) => {
                        if (!loc.unlocked) return null;

                        return (
                            <TouchableOpacity
                                key={id}
                                disabled={loc.visited} // ❌ если посещена — клики отключены
                                style={{
                                    position: "absolute",
                                    left: MAP_W * loc.x,
                                    top: MAP_H * loc.y,
                                    opacity: loc.visited ? 1 : 1,
                                    alignItems: "center",
                                }}
                                onPress={() => {
                                    if (loc.visited) return; // 🛡 защита на всякий случай
                                    visitLocation(id);
                                    changeScene(id);
                                }}
                                // activeOpacity={0.85}
                            >
                                {/* 📍 Маркер */}
                                <Image
                                    source={
                                        loc.visited
                                            ? require("../assets/icons/map_marker_gray.png")
                                            : require("../assets/icons/map_marker_red.png")
                                    }
                                    style={styles.marker}
                                />

                                {/* 🧭 Breadcrumb */}
                                <View
                                    style={[
                                        styles.breadcrumb,
                                        loc.visited && styles.breadcrumbVisited,
                                    ]}
                                >
                                    <Text style={styles.breadcrumbText}>
                                        {loc.name?.[lang]}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}

                </ImageBackground>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: "#000",
        overflow: "hidden",
    },
    mapWrapper: {
        position: "absolute",
        left: 0,
        top: 0,
    },
    marker: {
        width: 48,
        height: 48,
        resizeMode: "contain",
    },
    closeButton: {
        position: "absolute",
        top: 50,
        right: 20,
        padding: 10,
        zIndex: 20,
    },
    closeIcon: {
        width: 40,
        height: 40,
        resizeMode: "contain",
    },
    // Breadcrumb
    breadcrumb: {
        marginTop: 6,
        backgroundColor: "#EA0F12", // красный = новая локация
        paddingHorizontal: 14,
        paddingVertical: 4,
        borderRadius: 999,
        elevation: 4,
    },

    breadcrumbVisited: {
        backgroundColor: "#666", // серый = посещена
    },

    breadcrumbText: {
        color: "#fff",
        fontSize: 14,
        fontFamily: "BebasNeue-Regular",
        letterSpacing: 0.5,
    },

});
