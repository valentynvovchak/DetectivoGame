import React, {useState} from "react";
import {View, TouchableOpacity, Image, StyleSheet, Pressable} from "react-native";
import {Link, router} from "expo-router";
import SettingsModal from "@/components/SettingsModal";
import {isSmallScreen, isTablet} from "@/styles/global";
import InfoModal from "@/components/InfoModal";
import {useGameStore} from "@/store/gameStore";
import InventoryModal from "@/components/Inventory/InventoryModal";
import TasksModal from "@/components/Tasks/TasksModal";
import AppText from "@/components/Common/AppText";
import {SCALE as scale} from "@/tools/constants";
import IconFlyoutNotice from "@/components/Common/IconFlyoutNotice";
import {RESOURCES} from "@/assets/resources";
import SVGImage from "@/components/small/SVGImage";
import {getSprite} from "@/tools/utils";
import {LinearGradient} from "expo-linear-gradient";

const SCALE = scale * 3;

export default function MainMenu() {
    const {hasNewItems, unseenTaskActionsCount, clearTaskActionsCounter, hasSave, saveProgress} = useGameStore();
    const [openSettings, setOpenSettings] = useState(false);
    const [openInfo, setOpenInfo] = useState(false);
    const [inventoryVisible, setInventoryVisible] = useState(false);
    const [isTasksOpen, setIsTasksOpen] = useState(false);

    const openTasks = () => {
        setIsTasksOpen(true);
        clearTaskActionsCounter();
    };

    return (
        <>
            {/* Верхняя кнопка Info */}
            <TouchableOpacity onPress={() => setOpenInfo(true)} style={styles.infoButton}>
                <Image source={require("../assets/icons/info.png")} style={styles.iconSmall} />
            </TouchableOpacity>

            <Pressable
                style={styles.checkpointButton}
                onPress={async () => {
                    await saveProgress();
                }}
            >
                <AppText>
                    {hasSave ? "overwrite checkpoint" : "save checkpoint"}
                </AppText>
            </Pressable>
            {/* Нижняя панель */}
            <View style={styles.bottomMenu}>
                {/* Первая строка */}
                <View style={styles.row}>
                    <LinearGradient
                        colors={["#767680", "#CACA99"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }} // сверху вниз
                        style={{
                            borderRadius: 7,
                            padding: 3, // ← толщина рамки
                        }}
                    >
                        <TouchableOpacity onPress={() => setOpenSettings(true)} style={styles.iconWrap}>
                            <Image source={require("../assets/icons/settings2.png")} style={styles.icon} />
                        </TouchableOpacity>
                    </LinearGradient>


                    {/*<Link onPress={() => router.push("/map")} asChild>*/}
                    <LinearGradient
                        colors={["#767680", "#CACA99"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }} // сверху вниз
                        style={{
                            borderRadius: 7,
                            padding: 3, // ← толщина рамки
                        }}
                    >
                        <TouchableOpacity onPress={() => router.replace("/map")} style={styles.iconWrap}>
                            <Image source={require("../assets/icons/map.png")} style={styles.icon} />
                        </TouchableOpacity>
                    </LinearGradient>
                    {/*</Link>*/}
                </View>

                {/* Вторая строка */}
                <View style={styles.row}>
                    <View style={styles.menuButtonWrapper}>
                        <IconFlyoutNotice source="briefcase" />

                        <LinearGradient
                            colors={["#767680", "#CACA99"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0, y: 1 }}
                            style={styles.iconBorder}
                        >
                            <TouchableOpacity
                                onPress={() => setInventoryVisible(true)}
                                style={styles.iconWrap}
                            >
                                <Image
                                    source={require("../assets/icons/briefcase2.png")}
                                    style={styles.icon}
                                />
                            </TouchableOpacity>
                        </LinearGradient>

                        {hasNewItems && <View pointerEvents="none" style={styles.redDot} />}
                    </View>

                    <View style={styles.menuButtonWrapper}>
                        <IconFlyoutNotice source="tasks" />

                        <LinearGradient
                            colors={["#767680", "#CACA99"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0, y: 1 }}
                            style={styles.iconBorder}
                        >
                            <TouchableOpacity onPress={openTasks} style={styles.iconWrap}>
                                <Image
                                    source={require("../assets/icons/to-do-list2.png")}
                                    style={styles.icon}
                                />
                            </TouchableOpacity>
                        </LinearGradient>

                        {unseenTaskActionsCount > 0 && (
                            <View pointerEvents="none" style={styles.taskBadge}>
                                <AppText style={styles.taskBadgeText}>
                                    {unseenTaskActionsCount > 99 ? "99+" : unseenTaskActionsCount}
                                </AppText>
                            </View>
                        )}
                    </View>
                </View>
            </View>

            {/* Модалки */}
            <SettingsModal visible={openSettings} onClose={() => setOpenSettings(false)} />
            <InfoModal visible={openInfo} onClose={() => setOpenInfo(false)} />
            <InventoryModal
                visible={inventoryVisible}
                onClose={() => setInventoryVisible(false)}
            />
            <TasksModal
                visible={isTasksOpen}
                onClose={() => setIsTasksOpen(false)}
            />
        </>
    );
}

const styles = StyleSheet.create({
    bottomMenu: {
        maxWidth: 500,
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
    // iconWrap: {
    //     position: 'relative',
    //     // backgroundColor: "rgba(255,255,255,0.9)",
    //     backgroundColor: "#263A3B",
    //     padding: 4,
    //     borderRadius: 6
    // },
    icon: {
        width: isSmallScreen ? 35 : isTablet ? 50 : 40,
        height: isSmallScreen ? 35 : isTablet ? 50 : 40,
        resizeMode: "contain",
    },
    infoButton: {
        position: "absolute",
        top: 30,
        right: 30,
        backgroundColor: "rgba(255,255,255,0.9)",
        borderRadius: 8,
        paddingVertical: isTablet ? 12 : 8,
        paddingHorizontal: isTablet ? 10 : 6,
        zIndex: 10,
    },
    checkpointButton: {
        position: "absolute",
        top: 30,
        left: 30,
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
    // redDot: {
    //     position: "absolute",
    //     top: isSmallScreen ? -10 * SCALE : -6 * SCALE,
    //     right: isSmallScreen ? -10 * SCALE : -6 * SCALE,
    //     minWidth: isSmallScreen ? 20 * SCALE : 15 * SCALE,
    //     height: isSmallScreen ? 20 * SCALE : 15 * SCALE,
    //     borderRadius: 999,
    //     backgroundColor: "#D93636",
    //     borderWidth: 1.5 * SCALE,
    // },
    // taskBadge: {
    //     position: "absolute",
    //     top: isSmallScreen ? -10 * SCALE : -6 * SCALE,
    //     right: isSmallScreen ? -10 * SCALE : -6 * SCALE,
    //     minWidth: isSmallScreen ? 20 * SCALE : 15 * SCALE,
    //     height: isSmallScreen ? 20 * SCALE : 15 * SCALE,
    //     paddingHorizontal: 5 * SCALE,
    //     borderRadius: 999,
    //     backgroundColor: "#D93636",
    //     borderWidth: 1.5 * SCALE,
    //     // borderColor: "#F4E7C0",
    //     alignItems: "center",
    //     justifyContent: "center",
    //     zIndex: 20,
    // },
    // taskBadgeText: {
    //     position: "absolute",
    //     width: 20 * SCALE,
    //     color: "#FFFFFF",
    //     fontSize: isSmallScreen ? 11 * SCALE : 10 * SCALE,
    //     lineHeight: 10 * SCALE,
    //     textAlign: "center",
    // },
    // menuButtonWrapper: {
    //     position: "relative",
    //     overflow: "visible",
    //     alignItems: "center",
    //     justifyContent: "center",
    // },

    iconBorder: {
        borderRadius: 7,
        padding: 3,
        overflow: "visible",
        zIndex: 1,
    },

    iconWrap: {
        position: "relative",
        backgroundColor: "#263A3B",
        padding: 4,
        borderRadius: 6,
        overflow: "visible",
    },

    menuButtonWrapper: {
        position: "relative",
        overflow: "visible",
        alignItems: "center",
        justifyContent: "center",
    },

    redDot: {
        position: "absolute",
        top: -6,
        right: -6,
        width: isSmallScreen ? 18 : isTablet ? 22 : 20,
        height: isSmallScreen ? 18 : isTablet ? 22 : 20,
        borderRadius: 999,
        backgroundColor: "#D93636",
        borderWidth: 2,
        borderColor: "#263A3B",
        zIndex: 30,
        elevation: 30,
    },

    taskBadge: {
        position: "absolute",
        top: -8,
        right: -8,
        minWidth: isSmallScreen ? 20 : isTablet ? 24 : 22,
        height: isSmallScreen ? 20 : isTablet ? 24 : 22,
        paddingHorizontal: 5,
        borderRadius: 999,
        backgroundColor: "#D93636",
        borderWidth: 2,
        borderColor: "#263A3B",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 30,
        elevation: 30,
    },

    taskBadgeText: {
        color: "#FFFFFF",
        fontSize: isSmallScreen ? 10 : isTablet ? 13 : 11,
        lineHeight: isSmallScreen ? 12 : isTablet ? 15 : 13,
        textAlign: "center",
        fontFamily: "IBMPlexMono-Regular",
    },
});
