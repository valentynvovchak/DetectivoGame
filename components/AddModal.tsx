import React from "react";
import {
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";

import {
    width,
    height,
    isSmallScreen,
    isTablet,
} from "@/styles/global";

import AppText from "@/components/Common/AppText";

interface AddModalProps {
    toggle: (value: boolean) => void;

    onAdd?: () => void;
    onConfirm?: () => void;

    name?: string;
    question?: string;

    confirmText?: string;
    cancelText?: string;

    lang?: "ru" | "en";

    position?: {
        x: number;
        y: number;
        width?: number;
        height?: number;
    };
}

export default function AddModal({
                                     toggle,
                                     onAdd,
                                     onConfirm,

                                     name,
                                     question,

                                     confirmText,
                                     cancelText,

                                     lang = "en",

                                     position = {
                                         x: 0.2,
                                         y: 0.35,
                                         width: 0.6,
                                         height: 0.22,
                                     },
                                 }: AddModalProps) {
    const modalWidth = width * (position.width ?? 0.6);

    const defaultQuestion =
        lang === "ru"
            ? "Добавить предмет в инвентарь?"
            : "Add item to inventory?";

    const finalQuestion = question || defaultQuestion;

    const finalConfirmText =
        confirmText || (lang === "ru" ? "Да" : "Yes");

    const finalCancelText =
        cancelText || (lang === "ru" ? "Нет" : "No");

    const handleConfirm = () => {
        if (onConfirm) {
            onConfirm();
        } else {
            onAdd?.();
        }

        toggle(false);
    };

    return (
        <LinearGradient
            colors={["#CCCCCC", "#CACA99"]}
            start={{ x: 0, y: 1 }}
            end={{ x: 0, y: 0 }}
            style={[
                styles.gradientBorder,
                {
                    left: width * position.x,
                    top: height * position.y,
                    width: modalWidth,
                },
            ]}
        >
            <View style={styles.modal}>
                {!!name && (
                    <View style={styles.nameContainer}>
                        <AppText style={styles.itemText}>
                            {name}
                        </AppText>
                    </View>
                )}

                <AppText style={styles.questionText}>
                    {finalQuestion}
                </AppText>

                <View style={styles.buttons}>
                    <TouchableOpacity
                        style={[
                            styles.button,
                            styles.confirmButton,
                        ]}
                        activeOpacity={0.8}
                        onPress={handleConfirm}
                    >
                        <AppText
                            style={[
                                styles.buttonText,
                                styles.confirmButtonText,
                            ]}
                        >
                            {finalConfirmText}
                        </AppText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.button,
                            styles.cancelButton,
                        ]}
                        activeOpacity={0.8}
                        onPress={() => toggle(false)}
                    >
                        <AppText
                            style={[
                                styles.buttonText,
                                styles.cancelButtonText,
                            ]}
                        >
                            {finalCancelText}
                        </AppText>
                    </TouchableOpacity>
                </View>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradientBorder: {
        position: "absolute",

        borderRadius: 10,
        padding: 3,

        zIndex: 1000,
        elevation: 1000,

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },

    modal: {
        width: "100%",

        backgroundColor: "#385253",

        borderRadius: 7,

        paddingHorizontal: isTablet ? 22 : 14,
        paddingVertical: isTablet ? 18 : 14,

        alignItems: "center",
    },

    nameContainer: {
        alignSelf: "center",

        borderWidth: 1.5,
        borderColor: "#E9DEC1",

        borderRadius: 4,

        paddingHorizontal: isTablet ? 16 : 10,
        paddingVertical: isTablet ? 8 : 5,

        marginBottom: isTablet ? 20 : 14,
    },

    itemText: {
        color: "#F1E8C8",

        fontSize: isTablet
            ? 25
            : isSmallScreen
                ? 15
                : 19,

        lineHeight: isTablet
            ? 31
            : isSmallScreen
                ? 20
                : 24,

        fontFamily: "IBMPlexMono-Regular",
        fontStyle: "italic",

        textAlign: "center",
    },

    questionText: {
        width: "100%",

        color: "#FFFFFF",

        fontSize: isTablet
            ? 22
            : isSmallScreen
                ? 14
                : 19,

        lineHeight: isTablet
            ? 28
            : isSmallScreen
                ? 19
                : 24,

        fontFamily: "IBMPlexMono-Bold",

        textAlign: "center",

        marginBottom: isTablet ? 20 : 14,

        flexShrink: 1,
    },

    buttons: {
        flexDirection: "row",

        justifyContent: "center",
        alignItems: "center",

        gap: isTablet ? 32 : 20,
    },

    button: {
        minWidth: isTablet ? 72 : 52,

        borderWidth: 1.5,
        borderColor: "#E9DEC1",

        borderRadius: 5,

        paddingVertical: isTablet ? 9 : 6,
        paddingHorizontal: isTablet ? 18 : 12,

        justifyContent: "center",
        alignItems: "center",
    },

    confirmButton: {
        backgroundColor: "#F5E9CE",
    },

    cancelButton: {
        backgroundColor: "#294448",
    },

    buttonText: {
        fontSize: isTablet
            ? 20
            : isSmallScreen
                ? 14
                : 17,

        lineHeight: isTablet
            ? 25
            : isSmallScreen
                ? 18
                : 21,

        fontFamily: "IBMPlexMono-Regular",

        textAlign: "center",
    },

    confirmButtonText: {
        color: "#263A3B",
    },

    cancelButtonText: {
        color: "#FFFFFF",
    },
});