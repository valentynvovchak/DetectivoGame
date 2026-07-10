import React, { useEffect, useMemo, useState } from "react";

import {
    Modal,
    View,
    StyleSheet,
    TouchableOpacity,
} from "react-native";

import AppText from "@/components/Common/AppText";
import { useGameStore } from "@/store/gameStore";

type LocalizedText = {
    ru?: string;
    en?: string;
};

export type LogicChoiceOption = {
    id: string;

    text: LocalizedText;

    correct?: boolean;

    // Каждая опция сама знает,
    // на какую строку перейти после выбора.
    resultLine: number;
};

export type LogicChoiceConfig = {
    title?: LocalizedText;

    description?: LocalizedText;

    buttonText?: LocalizedText;

    confirmText?: LocalizedText;

    options: LogicChoiceOption[];
};

type Props = {
    visible: boolean;

    choice: LogicChoiceConfig;

    onClose: () => void;

    onResult: (result: {
        option: LogicChoiceOption;
        correct: boolean;
    }) => void;
};

export default function LogicChoiceModal({
         visible,
         choice,
         onClose,
         onResult,
     }: Props) {
    const { lang } = useGameStore();

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [confirmVisible, setConfirmVisible] = useState(false);

    useEffect(() => {
        if (!visible) return;

        setSelectedId(null);
        setConfirmVisible(false);
    }, [visible]);

    const selectedOption = useMemo(() => {
        if (!selectedId) return null;

        return (
            choice.options.find(
                (option) => option.id === selectedId
            ) || null
        );
    }, [selectedId, choice.options]);

    const getText = (value?: LocalizedText) => {
        if (!value) return "";

        return (
            value[lang] ||
            value.en ||
            value.ru ||
            ""
        );
    };

    const handleOptionPress = (option: LogicChoiceOption) => {
        setSelectedId(option.id);
    };

    const handleChoose = () => {
        if (!selectedOption) return;

        setConfirmVisible(true);
    };

    const handleConfirm = () => {
        if (!selectedOption) return;

        setConfirmVisible(false);

        onResult({
            option: selectedOption,
            correct: selectedOption.correct === true,
        });
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.panel}>
                    <AppText style={styles.logo}>
                        make 🧠 logic
                    </AppText>

                    {!!choice.description && (
                        <AppText style={styles.description}>
                            {getText(choice.description)}
                        </AppText>
                    )}

                    <View style={styles.options}>
                        {choice.options.map((option) => {
                            const selected =
                                option.id === selectedId;

                            return (
                                <TouchableOpacity
                                    key={option.id}
                                    activeOpacity={0.85}
                                    style={[
                                        styles.option,
                                        selected && styles.optionSelected,
                                    ]}
                                    onPress={() =>
                                        handleOptionPress(option)
                                    }
                                >
                                    <View
                                        style={[
                                            styles.checkbox,
                                            selected &&
                                            styles.checkboxSelected,
                                        ]}
                                    >
                                        {selected && (
                                            <AppText
                                                style={styles.checkmark}
                                            >
                                                ✓
                                            </AppText>
                                        )}
                                    </View>

                                    <AppText
                                        style={[
                                            styles.optionText,
                                            selected &&
                                            styles.optionTextSelected,
                                        ]}
                                    >
                                        {getText(option.text)}
                                    </AppText>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <TouchableOpacity
                        activeOpacity={0.85}
                        disabled={!selectedOption}
                        style={[
                            styles.chooseButton,
                            !selectedOption &&
                            styles.chooseButtonDisabled,
                        ]}
                        onPress={handleChoose}
                    >
                        <AppText style={styles.chooseButtonText}>
                            {lang === "ru"
                                ? "Выбрать"
                                : "Choose"}
                        </AppText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={0.85}
                        style={styles.backButton}
                        onPress={onClose}
                    >
                        <AppText style={styles.backText}>
                            {lang === "ru"
                                ? "назад"
                                : "back"}
                        </AppText>
                    </TouchableOpacity>
                </View>

                {confirmVisible && selectedOption && (
                    <View style={styles.confirmOverlay}>
                        <View style={styles.confirmBox}>
                            <AppText style={styles.confirmText}>
                                {getText(choice.confirmText) ||
                                    (lang === "ru"
                                        ? "Подтвердить выбор?"
                                        : "Confirm choice?")}
                            </AppText>

                            <View style={styles.confirmButtons}>
                                <TouchableOpacity
                                    activeOpacity={0.85}
                                    style={[
                                        styles.confirmButton,
                                        styles.confirmYes,
                                    ]}
                                    onPress={handleConfirm}
                                >
                                    <AppText
                                        style={styles.confirmYesText}
                                    >
                                        {lang === "ru"
                                            ? "Да"
                                            : "Yes"}
                                    </AppText>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    activeOpacity={0.85}
                                    style={[
                                        styles.confirmButton,
                                        styles.confirmNo,
                                    ]}
                                    onPress={() =>
                                        setConfirmVisible(false)
                                    }
                                >
                                    <AppText
                                        style={styles.confirmNoText}
                                    >
                                        {lang === "ru"
                                            ? "Нет"
                                            : "No"}
                                    </AppText>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,

        backgroundColor: "rgba(0,0,0,0.45)",

        justifyContent: "center",
        alignItems: "center",
    },

    panel: {
        width: "88%",
        maxWidth: 460,

        backgroundColor: "rgba(48, 82, 78, 0.98)",

        borderWidth: 2,
        borderColor: "#E9DEC1",

        borderRadius: 8,

        paddingHorizontal: 14,
        paddingTop: 20,
        paddingBottom: 16,

        alignItems: "center",

        overflow: "visible",
    },

    logo: {
        color: "#F4EAD0",

        fontSize: 22,
        lineHeight: 28,

        fontFamily: "IBMPlexMono-Bold",

        marginBottom: 14,
    },

    description: {
        width: "92%",

        color: "#FFFFFF",

        fontSize: 11,
        lineHeight: 15,

        textAlign: "center",

        fontFamily: "IBMPlexMono-Regular",

        marginBottom: 18,
    },

    options: {
        width: "100%",

        gap: 10,
    },

    option: {
        width: "100%",

        minHeight: 62,

        flexDirection: "row",
        alignItems: "center",

        backgroundColor: "rgba(29, 48, 48, 0.96)",

        borderWidth: 2,
        borderColor: "#E9DEC1",

        borderRadius: 6,

        paddingHorizontal: 10,
        paddingVertical: 8,
    },

    optionSelected: {
        backgroundColor: "#F1DFA7",

        borderColor: "#D8C88F",
    },

    checkbox: {
        width: 30,
        height: 30,

        borderWidth: 1.5,
        borderColor: "#FFFFFF",

        borderRadius: 8,

        justifyContent: "center",
        alignItems: "center",

        marginRight: 10,
    },

    checkboxSelected: {
        backgroundColor: "#56786F",

        borderColor: "#56786F",
    },

    checkmark: {
        color: "#F1DFA7",

        fontSize: 22,
        lineHeight: 25,

        fontFamily: "IBMPlexMono-Bold",
    },

    optionText: {
        flex: 1,

        color: "#FFFFFF",

        fontSize: 11,
        lineHeight: 15,

        fontFamily: "IBMPlexMono-Regular",
    },

    optionTextSelected: {
        color: "#314D4B",
    },

    chooseButton: {
        marginTop: 18,

        minWidth: 130,

        paddingHorizontal: 20,
        paddingVertical: 9,

        backgroundColor: "#294E4B",

        borderWidth: 1.5,
        borderColor: "#E9DEC1",

        borderRadius: 5,

        alignItems: "center",
        justifyContent: "center",
    },

    chooseButtonDisabled: {
        opacity: 0.4,
    },

    chooseButtonText: {
        color: "#FFFFFF",

        fontSize: 14,

        fontFamily: "IBMPlexMono-Regular",
    },

    backButton: {
        position: "absolute",

        left: 12,
        bottom: -50,

        paddingHorizontal: 14,
        paddingVertical: 8,

        backgroundColor: "rgba(30, 50, 50, 0.96)",

        borderWidth: 1.5,
        borderColor: "#E9DEC1",

        borderRadius: 5,

        zIndex: 20,
        elevation: 20,
    },

    backText: {
        color: "#FFFFFF",

        fontSize: 13,

        fontFamily: "IBMPlexMono-Regular",
    },

    confirmOverlay: {
        ...StyleSheet.absoluteFillObject,

        backgroundColor: "rgba(0,0,0,0.35)",

        justifyContent: "center",
        alignItems: "center",

        zIndex: 100,
        elevation: 100,
    },

    confirmBox: {
        width: "58%",
        maxWidth: 280,

        backgroundColor: "#385253",

        borderWidth: 2,
        borderColor: "#E9DEC1",

        borderRadius: 6,

        paddingHorizontal: 18,
        paddingVertical: 18,

        alignItems: "center",
    },

    confirmText: {
        color: "#FFFFFF",

        fontSize: 15,
        lineHeight: 20,

        textAlign: "center",

        fontFamily: "IBMPlexMono-Regular",

        marginBottom: 14,
    },

    confirmButtons: {
        flexDirection: "row",

        gap: 12,
    },

    confirmButton: {
        minWidth: 52,

        paddingHorizontal: 12,
        paddingVertical: 7,

        borderWidth: 1.5,
        borderColor: "#E9DEC1",

        borderRadius: 4,

        alignItems: "center",
        justifyContent: "center",
    },

    confirmYes: {
        backgroundColor: "#F5E9CE",
    },

    confirmNo: {
        backgroundColor: "#294448",
    },

    confirmYesText: {
        color: "#263A3B",

        fontSize: 13,

        fontFamily: "IBMPlexMono-Regular",
    },

    confirmNoText: {
        color: "#FFFFFF",

        fontSize: 13,

        fontFamily: "IBMPlexMono-Regular",
    },
});