import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import {isSmallScreen, isTablet} from "@/styles/global";
import {useGameStore} from "@/store/gameStore";
import AppText from "@/components/Common/AppText";

interface InfoModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function InfoModal({ visible, onClose }: InfoModalProps) {
    const { lang } = useGameStore();
    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <AppText style={styles.title}>{lang === "ru" ? "Как играть": "How to play"}</AppText>
                    <ScrollView style={styles.scroll}>
                        {lang === "ru" ? (
                            <AppText style={styles.text}>
                                🔍 В этой игре вы играете за детектива, расследующего загадочные дела в городе.
                                {"\n\n"}
                                🕵️‍♂️ Изучайте сцены, находите улики и стройте гипотезы.
                                {"\n\n"}
                                📂 Все найденные улики будут сохраняться в вашем досье.
                                {"\n\n"}
                                🗣️ В диалогах выбирайте реплики внимательно — от них зависит ход расследования.
                                {"\n\n"}
                                ⚙️ Настройки доступны через кнопку шестерёнки в нижней панели.
                                {"\n\n"}
                                💾 Игра автоматически сохраняется после каждого важного события.
                            </AppText>
                        ) : (
                            <AppText style={styles.text}>
                                🔍 In this game, you play as a detective investigating mysterious cases in the city.
                                {"\n\n"}
                                🕵️‍♂️ Explore scenes, find clues, and build hypotheses.
                                {"\n\n"}
                                📂 All discovered evidence will be saved in your case file.
                                {"\n\n"}
                                🗣️ Choose your dialogue responses carefully — they influence the course of the investigation.
                                {"\n\n"}
                                ⚙️ Settings are available via the gear icon in the bottom panel.
                                {"\n\n"}
                                💾 The game automatically saves after each important event.
                            </AppText>
                        )}
                    </ScrollView>

                    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                        <AppText style={styles.closeText}>{lang === "ru" ? "Закрыть": "Close"}</AppText>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.7)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    container: {
        backgroundColor: "#f5deb3",
        borderRadius: 20,
        width: "90%",
        maxWidth: isTablet ? 600 : 500,
        padding: 20,
        shadowColor: "#000",
        shadowOpacity: 0.5,
        shadowRadius: 6,
        elevation: 8,
    },
    title: {
        fontSize: isTablet ? 30 : 22,
        fontWeight: "bold",
        marginBottom: 12,
        color: "#2c2c2c",
        textAlign: "center",
    },
    scroll: {
        maxHeight: isTablet ? 650 : 300,
    },
    text: {
        fontSize: isSmallScreen ? 14 : isTablet ? 24 : 16,
        color: "#2c2c2c",
        lineHeight: isTablet ? 36 : 22,
    },
    closeBtn: {
        backgroundColor: "#2c2c2c",
        marginTop: 20,
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: "center",
    },
    closeText: {
        color: "#fff",
        fontSize: isTablet ? 24 : 16,
        fontWeight: "bold",
    },
});
