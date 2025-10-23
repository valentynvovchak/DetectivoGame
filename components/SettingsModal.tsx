import React from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Slider from '@react-native-community/slider'
import { useGameStore } from "@/store/gameStore";
import {isTablet} from "@/styles/global";

export default function SettingsModal({ visible, onClose }) {
    const { volume, setVolume, lang, setLang } = useGameStore();

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.panel}>
                    <Text style={styles.title}>{lang === "ru" ? "Настройки" : "Settings"}</Text>

                    <View style={styles.view}>
                        <Text style={styles.option}>{lang === "ru" ? "Громкость" : "Volume"}</Text>
                        <Slider value={volume} onValueChange={setVolume} minimumValue={0} maximumValue={1} />
                    </View>

                    <View style={styles.view}>
                        <Text style={styles.option}>{lang === "ru" ? "Язык" : "Language"}</Text>
                        <TouchableOpacity onPress={() => setLang(lang === "ru" ? "en" : "ru")}>
                            <Text style={styles.option}>{lang === "ru" ? "Русский" : "English"}</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity onPress={onClose} style={styles.close}>
                        <Text style={styles.closeText}>{lang === "ru" ? "Закрыть" : "Close"}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "center",
        alignItems: "center"
    },
    panel: {
        width: "80%",
        maxWidth: isTablet ? '600px' : '400px',
        backgroundColor: "#f4e1c1",
        padding: 20,
        borderRadius: 10
    },
    title: { fontSize: isTablet ? 36 : 22, fontWeight: "bold", marginBottom: isTablet ? 35 : 20 },
    view: {
        marginBottom: isTablet ? 35 : 10
    },
    option: {
        fontSize: isTablet ? 32 : 22
    },
    close: {
        backgroundColor: "#333",
        paddingVertical: 10,
        borderRadius: 6,
        marginTop: 20,
        alignItems: "center"
    },
    closeText: {
        color: "#fff",
        fontSize: isTablet ? 32 : 22
    }
});
