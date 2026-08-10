import React, { useEffect, useMemo, useState } from "react";
import {
    Pressable,
    StyleSheet,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import AppText from "@/components/Common/AppText";
import MixedIcon from "@/components/Common/MixedIcon";
import {SCALE} from "@/tools/constants";

type Lang = "ru" | "en";

type LocalizedText = {
    ru?: string;
    en?: string;
};

export type NextStepOption = {
    id: string;

    text: LocalizedText;

    icon?: string;

    correct: boolean;
    resultLine: number;

    hpPenalty?: number;
};

export type NextStepChoiceConfig = {
    title?: LocalizedText;
    description?: LocalizedText;
    buttonText?: LocalizedText;
    selectText?: LocalizedText;

    options: NextStepOption[];
};

type Props = {
    visible: boolean;
    lang: Lang;

    choice: NextStepChoiceConfig;

    onClose: () => void;
    onResult: (result: {
        option: NextStepOption;
        correct: boolean;
    }) => void;
};

export default function NextStepChoiceModal({
        visible,
        lang,
        choice,
        onClose,
        onResult,
    }: Props) {
    const { width, height } = useWindowDimensions();

    const [selectedId, setSelectedId] =
        useState<string | null>(null);

    useEffect(() => {
        if (visible) {
            setSelectedId(null);
        }
    }, [visible]);

    const selectedOption = useMemo(
        () =>
            choice.options.find(
                (option) => option.id === selectedId
            ) ?? null,
        [choice.options, selectedId]
    );

    const rows = useMemo(() => {
        const result: NextStepOption[][] = [];

        for (
            let index = 0;
            index < choice.options.length;
            index += 2
        ) {
            result.push(
                choice.options.slice(index, index + 2)
            );
        }

        return result;
    }, [choice.options]);

    if (!visible) {
        return null;
    }

    const panelWidth = Math.min(width * 0.9, 620);
    const isTabletScreen = width >= 700;

    const getLocalizedText = (
        value?: LocalizedText
    ): string => {
        return (
            value?.[lang] ??
            value?.en ??
            value?.ru ??
            ""
        );
    };

    const handleSubmit = () => {
        if (!selectedOption) {
            return;
        }

        onResult({
            option: selectedOption,
            correct: selectedOption.correct,
        });
    };

    return (
        <Pressable
            style={styles.overlay}
            onPress={(event) => {
                event.stopPropagation();
            }}
        >
            <View
                style={[
                    styles.content,
                    {
                        width: panelWidth,
                        maxHeight: height * 0.78,
                    },
                ]}
            >
                <LinearGradient
                    colors={["#CCCCCC", "#CACA99"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={styles.panelBorder}
                >
                    <View style={styles.panel}>
                        <AppText
                            style={[
                                styles.title,
                                {
                                    fontSize: isTabletScreen
                                        ? 25
                                        : 19,
                                },
                            ]}
                        >
                            {getLocalizedText(choice.title) ||
                                "make 🧠 logic"}
                        </AppText>

                        {!!getLocalizedText(
                            choice.description
                        ) && (
                            <AppText
                                style={[
                                    styles.description,
                                    {
                                        fontSize:
                                            isTabletScreen
                                                ? 16
                                                : 12,
                                        lineHeight:
                                            isTabletScreen
                                                ? 21
                                                : 16,
                                    },
                                ]}
                            >
                                {getLocalizedText(
                                    choice.description
                                )}
                            </AppText>
                        )}

                        <View style={styles.optionsContainer}>
                            {rows.map((row, rowIndex) => (
                                <View
                                    key={`row_${rowIndex}`}
                                    style={[
                                        styles.optionRow,
                                        row.length === 1 &&
                                        styles.singleOptionRow,
                                    ]}
                                >
                                    {row.map((option) => {
                                        const active =
                                            option.id === selectedId;

                                        return (
                                            <Pressable
                                                key={option.id}
                                                style={({ pressed }) => [
                                                    styles.optionCard,
                                                    active && styles.optionCardActive,
                                                    pressed && styles.optionCardPressed,
                                                ]}
                                                onPress={(event) => {
                                                    event.stopPropagation();
                                                    setSelectedId(option.id);
                                                }}
                                            >
                                                {!!option.icon && (
                                                    <View
                                                        style={[
                                                            styles.optionIcon,
                                                            active && styles.optionIconActive,
                                                        ]}
                                                    >
                                                        <MixedIcon
                                                            icon={option.icon}
                                                            width={52}
                                                            height={52}
                                                            resizeMode="cover"
                                                        />
                                                    </View>
                                                )}

                                                <AppText
                                                    style={[
                                                        styles.optionText,
                                                        active && styles.optionTextActive,
                                                    ]}
                                                >
                                                    {getLocalizedText(option.text)}
                                                </AppText>

                                                {active && (
                                                    <View style={styles.selectedIndicator} />
                                                )}
                                            </Pressable>
                                        );
                                    })}
                                </View>
                            ))}
                        </View>

                        <Pressable
                            disabled={!selectedOption}
                            onPress={(event) => {
                                event.stopPropagation();
                                handleSubmit();
                            }}
                            style={({ pressed }) => [
                                styles.selectButton,
                                !selectedOption && styles.selectButtonDisabled,
                                selectedOption &&
                                pressed &&
                                styles.selectButtonPressed,
                            ]}
                        >
                            <AppText
                                style={[
                                    styles.selectButtonText,
                                    !selectedOption &&
                                    styles.selectButtonTextDisabled,
                                ]}
                            >
                                {getLocalizedText(choice.selectText) ||
                                    (lang === "ru"
                                        ? "Выбрать"
                                        : "Select")}
                            </AppText>
                        </Pressable>
                    </View>
                </LinearGradient>

                <TouchableOpacity
                    activeOpacity={0.85}
                    style={styles.backButton}
                    onPress={(event) => {
                        event.stopPropagation();
                        onClose();
                    }}
                >
                    <AppText style={styles.backButtonText}>
                        {lang === "ru" ? "назад" : "back"}
                    </AppText>
                </TouchableOpacity>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,

        backgroundColor: "rgba(0, 0, 0, 0.42)",

        alignItems: "center",
        justifyContent: "center",

        zIndex: 3000,
        elevation: 3000,
    },

    content: {
        alignItems: "flex-start",
    },

    panelBorder: {
        width: "100%",

        padding: 2,

        borderRadius: 7,
    },

    panel: {
        width: "100%",

        backgroundColor: "rgba(48, 82, 78, 0.98)",

        borderRadius: 5,

        paddingHorizontal: 12,
        paddingVertical: 16,

        alignItems: "center",
    },

    title: {
        color: "#F7EFE4",

        fontFamily: "IBMPlexMono-Bold",

        textAlign: "center",

        marginBottom: 12,
    },

    description: {
        width: "94%",

        color: "#F7EFE4",

        fontFamily: "IBMPlexMono-Regular",

        textAlign: "center",

        marginBottom: 16,
    },

    singleOptionRow: {
        justifyContent: "center",
    },

    backButton: {
        marginTop: 10,

        backgroundColor: "rgba(43, 47, 47, 0.96)",

        borderWidth: 1.5,
        borderColor: "#FFFFFF",

        borderRadius: 5,

        paddingHorizontal: 16,
        paddingVertical: 9,
    },

    backButtonText: {
        color: "#FFFFFF",

        fontFamily: "IBMPlexMono-Regular",

        fontSize: 14,
    },

    optionCard: {
        position: "relative",

        width: "48%",
        minHeight: 90,

        flexDirection: "row",
        alignItems: "center",

        backgroundColor: "#F1DFA7",

        borderWidth: 2,
        borderColor: "#CACA99",
        borderRadius: 8,

        paddingHorizontal: 10,
        paddingVertical: 10,

        overflow: "hidden",

        elevation: 2,

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.12,
        shadowRadius: 2,
    },

    optionCardActive: {
        backgroundColor: "#294A48",

        // borderWidth: 3,
        borderColor: "#F1DFA7",

        elevation: 7,

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.32,
        shadowRadius: 5,
    },

    optionCardPressed: {
        opacity: 0.82,

        transform: [
            {
                scale: 0.98,
            },
        ],
    },
    optionIcon: {
        width: 54,
        height: 54,

        flexShrink: 0,

        marginRight: 9,

        borderWidth: 1.5,
        borderColor: "#557B72",
        borderRadius: 7,

        overflow: "hidden",

        backgroundColor: "#FFFFFF",

        alignItems: "center",
        justifyContent: "center",
    },

    optionIconActive: {
        borderColor: "#F1DFA7",
        // borderWidth: 2,
    },

    optionText: {
        flex: 1,
        flexShrink: 1,

        color: "#354947",

        fontFamily: "IBMPlexMono-Regular",

        fontSize: 11 * 3 * SCALE,
        lineHeight: 14 * 3 * SCALE,

        textAlign: "left",
    },

    optionTextActive: {
        color: "#FFF4D1",

        // fontFamily: "IBMPlexMono-Bold",
    },

    selectedIndicator: {
        position: "absolute",

        top: 7,
        right: 7,

        width: 10,
        height: 10,

        borderRadius: 999,

        backgroundColor: "#F1DFA7",

        borderWidth: 2,
        borderColor: "#FFFFFF",
    },

    selectButton: {
        minWidth: 170,
        minHeight: 58,

        marginTop: 22,

        backgroundColor: "#1E3535",

        borderWidth: 3,
        borderColor: "#F1DFA7",
        borderRadius: 8,

        paddingHorizontal: 28,
        paddingVertical: 12,

        alignItems: "center",
        justifyContent: "center",

        elevation: 8,

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },

    selectButtonDisabled: {
        backgroundColor: "rgba(30, 53, 53, 0.45)",

        borderColor: "rgba(241, 223, 167, 0.4)",

        elevation: 0,

        shadowOpacity: 0,
    },

    selectButtonPressed: {
        transform: [
            {
                scale: 0.96,
            },
        ],

        backgroundColor: "#315957",
    },

    selectButtonText: {
        color: "#FFFFFF",

        fontFamily: "IBMPlexMono-Regular",

        fontSize: 19,
        lineHeight: 24,

        textAlign: "center",
    },

    selectButtonTextDisabled: {
        color: "rgba(255, 255, 255, 0.4)",
    },

    optionsContainer: {
        width: "100%",
        gap: 12,
    },

    optionRow: {
        width: "100%",

        flexDirection: "row",
        alignItems: "stretch",

        justifyContent: "space-between",

        gap: 12,
    },
});