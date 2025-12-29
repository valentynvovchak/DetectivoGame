import React, {useState} from "react";
import { View, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Link } from "expo-router";
import SettingsModal from "@/components/SettingsModal";
import {isSmallScreen, isTablet} from "@/styles/global";
import InfoModal from "@/components/InfoModal";
import {useGameStore} from "@/store/gameStore";
import InventoryModal from "@/components/InventoryModal";

export default function MainMenu() {
    const {hasNewItems} = useGameStore();
    const [openSettings, setOpenSettings] = useState(false);
    const [openInfo, setOpenInfo] = useState(false);
    const [inventoryVisible, setInventoryVisible] = useState(false);

    return (
        <>
            {/* Верхняя кнопка Info */}
            <TouchableOpacity onPress={() => setOpenInfo(true)} style={styles.infoButton}>
                <Image source={require("../assets/icons/info.png")} style={styles.iconSmall} />
            </TouchableOpacity>
            {/* Нижняя панель */}
            <View style={styles.bottomMenu}>
                {/* Первая строка */}
                <View style={styles.row}>
                    <TouchableOpacity onPress={() => setOpenSettings(true)} style={styles.iconWrap}>
                        <Image source={require("../assets/icons/settings.png")} style={styles.icon} />
                    </TouchableOpacity>

                    <Link href="../app/street_intro" asChild>
                        <TouchableOpacity style={styles.iconWrap}>
                            <Image source={require("../assets/icons/map.png")} style={styles.icon} />
                        </TouchableOpacity>
                    </Link>
                </View>

                {/* Вторая строка */}
                <View style={styles.row}>
                    <TouchableOpacity onPress={() => setInventoryVisible(true)} style={styles.iconWrap}>
                        <Image source={require("../assets/icons/briefcase.png")} style={styles.icon} />
                        {hasNewItems && <View style={styles.redDot} />}
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.iconWrap}>
                        <Image source={require("../assets/icons/checklist.png")} style={styles.icon} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Модалки */}
            <SettingsModal visible={openSettings} onClose={() => setOpenSettings(false)} />
            <InfoModal visible={openInfo} onClose={() => setOpenInfo(false)} />
            <InventoryModal
                visible={inventoryVisible}
                onClose={() => setInventoryVisible(false)}
            />
        </>
    );
}

const styles = StyleSheet.create({
    bottomMenu: {
        maxWidth: '500px',
        position: "absolute",
        bottom: 0,
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        width: "100%",
        // paddingVertical: "5%",
        paddingVertical: 40,
        // backgroundColor: "rgba(0,0,0,0.2)",
    },
    row: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 24, // Расстояние между иконками
        marginVertical: 6, // Отступ между рядами
    },
    iconWrap: {
        position: 'relative',
        backgroundColor: "rgba(255,255,255,0.9)",
        padding: 10,
        borderRadius: 12,
    },
    icon: {
        width: isSmallScreen ? 35 : isTablet ? 50 : 40,
        height: isSmallScreen ? 35 : isTablet ? 50 : 40,
        resizeMode: "contain",
    },
    infoButton: {
        position: "absolute",
        top: 45,
        right: 30,
        backgroundColor: "rgba(255,255,255,0.9)",
        borderRadius: 8,
        paddingVertical: isTablet ? 12 : 8,
        paddingHorizontal: isTablet ? 10 : 6,
        zIndex: 10,
    },
    iconSmall: {
        width: isTablet ? 48 : 28,
        height: isTablet ? 48 : 28,
        resizeMode: "contain",
    },
    redDot: {
        position: "absolute",
        right: -4,
        top: -4,
        width: 15,
        height: 15,
        borderRadius: 6,
        backgroundColor: "#FF3B30",
    },
});
