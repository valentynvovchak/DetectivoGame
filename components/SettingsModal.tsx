import React from "react";
import {Modal, View, Text, StyleSheet, TouchableOpacity, Pressable} from "react-native";
import Slider from '@react-native-community/slider'
import { useGameStore } from "@/store/gameStore";
import {isTablet} from "@/styles/global";
import {router} from "expo-router";
import { usePathname } from 'expo-router';
import AppText from "@/components/Common/AppText";
import {SCALE} from "@/tools/constants";

export default function SettingsModal({ visible, onClose }) {
    const { volume, setVolume, lang, setLang } = useGameStore();
    const pathname = usePathname();

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.panel}>
                    <AppText style={styles.title}>{lang === "ru" ? "Настройки" : "Settings"}</AppText>

                    <View style={styles.view}>
                        <AppText style={styles.optionTitle}>{lang === "ru" ? "Громкость" : "Volume"}</AppText>
                        <Slider value={volume} onValueChange={setVolume} minimumValue={0} maximumValue={1} />
                    </View>

                    <View style={styles.view}>
                        <AppText style={styles.optionTitle}>Language</AppText>
                        {/*<AppButton title={lang === "ru" ? "Русский" : "English"} onPress={() => setLang(lang === "ru" ? "en" : "ru")} />*/}
                        <View style={styles.langRow}>
                            <Pressable
                                onPress={() => setLang('ru')}
                                style={[
                                    styles.langChip,
                                    lang === 'ru' && styles.langChipActive
                                ]}
                            >
                                <AppText style={styles.langText}>RU</AppText>
                            </Pressable>

                            <Pressable
                                onPress={() => setLang('en')}
                                style={[
                                    styles.langChip,
                                    lang === 'en' && styles.langChipActive
                                ]}
                            >
                                <AppText style={styles.langText}>EN</AppText>
                            </Pressable>
                        </View>
                    </View>

                    {pathname !== '/' && (
                        <View style={styles.view}>
                            <TouchableOpacity onPress={() => {onClose(); router.replace('/');}}>
                                <AppText style={styles.option}>{lang === "ru" ? "Выйти из игры" : "Exit the game"}</AppText>
                            </TouchableOpacity>
                        </View>
                    )}

                    <TouchableOpacity onPress={onClose} style={styles.close}>
                        <AppText style={styles.closeText}>{lang === "ru" ? "Закрыть" : "Close"}</AppText>
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
    optionTitle: {
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
    },

    // langRow
    langRow: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 6,
    },
    langChip: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: '#aaa',
    },
    langChipActive: {
        backgroundColor: '#333',
    },
    langText: {
        fontSize: 33 * SCALE,
        color: '#fff',
        fontWeight: '600',
    }

});
