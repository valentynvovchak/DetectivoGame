import React, {useEffect, useRef, useState} from "react";
import {
    TouchableOpacity,
    Image,
    StyleSheet,
    ImageBackground,
    Animated,
    PanResponder,
    Dimensions,
    View,
} from "react-native";

import { getBackground } from "@/tools/utils";
import { useGameStore } from "@/store/gameStore";
import { router } from "expo-router";
import AppText from "@/components/Common/AppText";
import { ICONS } from "@/assets/icons";
import MixedIcon from "@/components/Common/MixedIcon";
import {height, isTablet, width} from "@/styles/global";
import {SCALE} from "@/tools/constants";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

const MAP_W = SCREEN_W * 1.4;
const MAP_H = SCREEN_H * 1.4;

const MIN_X = SCREEN_W - MAP_W;
const MAX_X = 0;
const MIN_Y = SCREEN_H - MAP_H;
const MAX_Y = 0;

const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max);

export default function WorldMap() {
    const { currentScene, mapLocations, visitLocation, changeScene, lang, mapNotification, setMapNotification } = useGameStore();

    const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
        null
    );

    const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
    const last = useRef({ x: 0, y: 0 });

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gesture) => {
                return Math.abs(gesture.dx) > 4 || Math.abs(gesture.dy) > 4;
            },

            onPanResponderMove: (_, gesture) => {
                const x = clamp(last.current.x + gesture.dx, MIN_X, MAX_X);
                const y = clamp(last.current.y + gesture.dy, MIN_Y, MAX_Y);

                pan.setValue({ x, y });
            },

            onPanResponderRelease: () => {
                last.current = {
                    x: (pan.x as any)._value,
                    y: (pan.y as any)._value,
                };
            },
        })
    ).current;

    const selectedLocation = selectedLocationId
        ? (mapLocations as any)[selectedLocationId]
        : null;

    const notificationOpacity = useRef(
        new Animated.Value(0)
    ).current;

    const notificationTranslateY = useRef(
        new Animated.Value(30)
    ).current;

    const goToSelectedLocation = async () => {
        if (!selectedLocationId || !selectedLocation) {
            return;
        }

        const targetScene =
            selectedLocation.targetScene ||
            selectedLocationId;

        console.log("🗺️ Going to location:", {
            selectedLocationId,
            targetScene,
        });

        await visitLocation(selectedLocationId);

        if (
            mapNotification?.locationId ===
            selectedLocationId
        ) {
            setMapNotification(null);
        }

        await changeScene(targetScene);
    };

    useEffect(() => {
        if (!mapNotification) {
            return;
        }

        notificationOpacity.setValue(0);
        notificationTranslateY.setValue(30);

        Animated.parallel([
            Animated.timing(notificationOpacity, {
                toValue: 1,
                duration: 700,
                delay: 400,
                useNativeDriver: true,
            }),

            Animated.timing(notificationTranslateY, {
                toValue: 0,
                duration: 700,
                delay: 400,
                useNativeDriver: true,
            }),
        ]).start();
    }, [mapNotification]);

    return (
        <View style={styles.root}>
            <TouchableOpacity
                style={styles.closeButton}
                onPress={() => router.replace(`/${currentScene}`)}
                activeOpacity={0.85}
            >
                <Image
                    source={require("../assets/icons/icon_close.png")}
                    style={styles.closeIcon}
                />
            </TouchableOpacity>

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
                    {Object.entries(mapLocations as any).map(([id, loc]: any) => {
                        if (!loc.unlocked) return null;

                        const isSelected = selectedLocationId === id;

                        const hasCustomIcon = !!loc.icon && !!(ICONS as any)[loc.icon];

                        const iconSource = hasCustomIcon
                            ? (ICONS as any)[loc.icon]
                            : loc.visited
                                ? ICONS["map_marker_gray.png"]
                                : ICONS["map_marker_red.png"];

                        return (
                            <View
                                key={id}
                                style={[
                                    styles.locationWrap,

                                    isSelected && styles.locationWrapSelected,

                                    {
                                        left: MAP_W * loc.x,
                                        top: MAP_H * loc.y,
                                    },
                                ]}
                            >
                                <TouchableOpacity
                                    activeOpacity={0.85}
                                    onPress={() => !loc.visited ? setSelectedLocationId(id): null}
                                    style={styles.locationButton}
                                >
                                    <View style={styles.locationIconWrap}>
                                        <Image
                                            source={iconSource}
                                            style={[
                                                styles.locationIcon,
                                                loc.visited && styles.locationIconVisited,
                                                isSelected && styles.locationIconSelected,
                                            ]}
                                        />

                                        {hasCustomIcon && (
                                            <Image
                                                source={ICONS["red_triangle.png"]}
                                                style={styles.locationTriangle}
                                            />
                                        )}
                                    </View>
                                </TouchableOpacity>

                                {isSelected && (
                                    <View style={styles.locationPopup}>
                                        <View style={styles.popupTail} />

                                        <AppText style={styles.popupTitle}>
                                            {loc.name?.[lang] || loc.name?.en}
                                        </AppText>

                                        <AppText style={styles.popupText}>
                                            {lang === "ru"
                                                ? "Перейти в эту локацию?"
                                                : "Go to this location?"}
                                        </AppText>

                                        <View style={styles.popupButtons}>
                                            <TouchableOpacity
                                                style={[
                                                    styles.popupButton,
                                                    styles.popupButtonSecondary,
                                                ]}
                                                activeOpacity={0.8}
                                                onPress={() =>
                                                    setSelectedLocationId(null)
                                                }
                                            >
                                                <AppText style={styles.popupButtonText}>
                                                    {lang === "ru" ? "Отмена" : "Cancel"}
                                                </AppText>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={[
                                                    styles.popupButton,
                                                    styles.popupButtonPrimary,
                                                ]}
                                                activeOpacity={0.8}
                                                onPress={goToSelectedLocation}
                                            >
                                                <AppText style={styles.popupButtonText}>
                                                    {lang === "ru" ? "Перейти" : "Go"}
                                                </AppText>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </ImageBackground>
            </Animated.View>

            {mapNotification && (
                <View
                    pointerEvents="none"
                    style={[
                        styles.mapNotification,
                        mapNotification.placement === "top"
                            ? styles.mapNotificationTop
                            : styles.mapNotificationBottom,
                    ]}
                >
                    {!!mapNotification.icon && (
                        <View style={styles.mapNotificationIcon}>
                            <MixedIcon
                                icon={mapNotification.icon}
                                width={46}
                                height={46}
                                resizeMode="contain"
                            />
                        </View>
                    )}

                    <AppText style={styles.mapNotificationText}>
                        {mapNotification.text?.[lang] ||
                            mapNotification.text?.en ||
                            ""}
                    </AppText>
                </View>
            )}
            {/*{mapNotification && (
                <Animated.View
                    pointerEvents="none"
                    style={[
                        styles.mapNotification,
                        {
                            opacity: notificationOpacity,

                            transform: [
                                {
                                    translateY:
                                    notificationTranslateY,
                                },
                            ],
                        },
                    ]}
                >
                    <AppText style={styles.mapNotificationText}>
                        {mapNotification.text?.[lang] ||
                            mapNotification.text?.en}
                    </AppText>
                </Animated.View>
            )}*/}
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

    closeButton: {
        position: "absolute",
        top: 50,
        right: 20,
        padding: 10,
        zIndex: 50,
        elevation: 50,
    },

    closeIcon: {
        width: 40,
        height: 40,
        resizeMode: "contain",
    },

    locationWrap: {
        position: "absolute",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10,
        elevation: 10,
    },

    locationButton: {
        alignItems: "center",
        justifyContent: "center",
    },

    locationIcon: {
        width: 68,
        height: 68,
        resizeMode: "contain",
    },

    locationIconVisited: {
        opacity: 0.7,
    },

    locationIconSelected: {
        transform: [{ scale: 1.08 }],
    },

    locationPopup: {
        position: "absolute",

        bottom: 82,

        width: 230,
        minHeight: 105,

        backgroundColor: "rgba(33, 55, 54, 0.96)",

        borderWidth: 1.5,
        borderColor: "#E9DEC1",
        borderRadius: 8,

        paddingHorizontal: 12,
        paddingVertical: 10,

        alignItems: "center",

        zIndex: 1100,
        elevation: 1100,
    },

    popupTail: {
        position: "absolute",
        bottom: -8,
        width: 16,
        height: 16,
        backgroundColor: "rgba(33, 55, 54, 0.96)",
        borderRightWidth: 1.5,
        borderBottomWidth: 1.5,
        borderColor: "#E9DEC1",
        transform: [{ rotate: "45deg" }],
    },

    popupTitle: {
        color: "#F4EAD0",
        fontSize: 15,
        lineHeight: 19,
        textAlign: "center",
        fontFamily: "IBMPlexMono-Bold",
        marginBottom: 6,
    },

    popupText: {
        color: "#FFFFFF",
        fontSize: 12,
        lineHeight: 16,
        textAlign: "center",
        opacity: 0.9,
        marginBottom: 10,
    },

    popupButtons: {
        flexDirection: "row",
        gap: 10,
    },

    popupButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: "#E9DEC1",
    },

    popupButtonPrimary: {
        backgroundColor: "rgba(48, 98, 68, 0.95)",
    },

    popupButtonSecondary: {
        backgroundColor: "rgba(70, 70, 70, 0.9)",
    },

    popupButtonText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontFamily: "IBMPlexMono-Regular",
    },

    // mapNotification: {
    //     position: "absolute",
    //
    //     left: "6%",
    //     right: "6%",
    //
    //     bottom: "5%",
    //
    //     backgroundColor: "rgba(42, 72, 70, 0.97)",
    //
    //     borderWidth: 2,
    //     borderColor: "#E9DEC1",
    //
    //     borderRadius: 6,
    //
    //     paddingHorizontal: 16,
    //     paddingVertical: 14,
    //
    //     zIndex: 200,
    //     elevation: 200,
    //
    //     shadowColor: "#000",
    //     shadowOffset: {
    //         width: 0,
    //         height: 4,
    //     },
    //     shadowOpacity: 0.3,
    //     shadowRadius: 6,
    // },

    // mapNotificationText: {
    //     color: "#FFFFFF",
    //
    //     fontSize: 14,
    //     lineHeight: 19,
    //
    //     fontFamily: "IBMPlexMono-Regular",
    // },
    locationIconWrap: {
        position: "relative",

        alignItems: "center",
        justifyContent: "center",

        overflow: "visible",

        zIndex: 1,
        elevation: 1,
    },

    locationTriangle: {
        position: "absolute",

        bottom: -18,
        left: '52%',
        transform: [{ translateX: '-50%' }],

        width: 22,
        height: 16,

        resizeMode: "contain",

        zIndex: 20,
        elevation: 20,
    },

    mapNotification: {
        position: "absolute",

        left: width * 0.06,
        right: width * 0.06,

        minHeight: 76,

        flexDirection: "row",
        alignItems: "center",

        backgroundColor: "rgba(48, 82, 78, 0.97)",

        borderWidth: 2,
        borderColor: "#E9DEC1",
        borderRadius: 7,

        paddingHorizontal: 14,
        paddingVertical: 12,

        zIndex: 500,
        elevation: 500,

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 5,
    },

    mapNotificationTop: {
        top: height * 0.13,
    },

    mapNotificationBottom: {
        bottom: height * 0.08,
    },

    mapNotificationIcon: {
        width: 52,
        height: 52,

        flexShrink: 0,

        marginRight: 12,

        alignItems: "center",
        justifyContent: "center",
    },

    mapNotificationText: {
        flex: 1,

        color: "#F7EFE4",

        fontFamily: "IBMPlexMono-Regular",

        fontSize: isTablet ? 19 * 3 * SCALE : 14 * 3 * SCALE,
        lineHeight: isTablet ? 25 * 3 * SCALE : 19 * 3 * SCALE,

        textAlign: "left",
    },

    locationWrapSelected: {
        zIndex: 1000,
        elevation: 1000,
    },
});