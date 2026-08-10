import React, {useState} from "react";
import {View, TouchableOpacity, Image, StyleSheet, Pressable} from "react-native";
import {router} from "expo-router";
import SettingsModal from "@/components/SettingsModal";
import {isSmallScreen, isTablet} from "@/styles/global";
import InfoModal from "@/components/InfoModal";
import {useGameStore} from "@/store/gameStore";
import InventoryModal from "@/components/Inventory/InventoryModal";
import TasksModal from "@/components/Tasks/TasksModal";
import AppText from "@/components/Common/AppText";
import IconFlyoutNotice from "@/components/Common/IconFlyoutNotice";
import {LinearGradient} from "expo-linear-gradient";


type MainMenuProps = {
    mainScreen?: boolean;
};

export default function MainMenu({
    mainScreen = false,
}: MainMenuProps) {
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

            {!mainScreen && (
                <Pressable
                    style={styles.checkpointButton}
                    onPress={async () => {
                        await saveProgress();
                    }}
                >
                    <AppText>
                        {hasSave
                            ? "overwrite"
                            : "save"}
                    </AppText>
                </Pressable>
            )}
            {/* Нижняя панель */}
            <View
                style={[
                    styles.bottomMenu,
                    mainScreen && styles.bottomMenuMain,
                ]}
            >
                {/* Настройки доступны везде */}
                <View style={styles.row}>
                    <LinearGradient
                        colors={["#767680", "#CACA99"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={styles.iconGradient}
                    >
                        <TouchableOpacity
                            onPress={() => setOpenSettings(true)}
                            style={styles.iconWrap}
                        >
                            <Image
                                source={require("../assets/icons/settings2.png")}
                                style={styles.icon}
                            />
                        </TouchableOpacity>
                    </LinearGradient>

                    {/* Карта только во время игры */}
                    {!mainScreen && (
                        <LinearGradient
                            colors={["#767680", "#CACA99"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0, y: 1 }}
                            style={styles.iconGradient}
                        >
                            <TouchableOpacity
                                onPress={() => router.push("/map")}
                                style={styles.iconWrap}
                            >
                                <Image
                                    source={require("../assets/icons/map.png")}
                                    style={styles.icon}
                                />
                            </TouchableOpacity>
                        </LinearGradient>
                    )}
                </View>

                {/* Кейс и задачи только во время игры */}
                {!mainScreen && (
                    <View style={styles.row}>
                        <View style={styles.menuButtonWrapper}>
                            <IconFlyoutNotice source="briefcase" />

                            <LinearGradient
                                colors={["#767680", "#CACA99"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 0, y: 1 }}
                                style={styles.iconGradient}
                            >
                                <TouchableOpacity
                                    onPress={() => setInventoryVisible(true)}
                                    style={styles.iconWrap}
                                >
                                    <Image
                                        source={require("../assets/icons/briefcase2.png")}
                                        style={styles.icon}
                                    />

                                    {hasNewItems && (
                                        <View style={styles.redDot} />
                                    )}
                                </TouchableOpacity>
                            </LinearGradient>
                        </View>

                        <View style={styles.menuButtonWrapper}>
                            <IconFlyoutNotice source="tasks" />

                            <LinearGradient
                                colors={["#767680", "#CACA99"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 0, y: 1 }}
                                style={styles.iconGradient}
                            >
                                <TouchableOpacity
                                    onPress={openTasks}
                                    style={styles.iconWrap}
                                >
                                    <Image
                                        source={require("../assets/icons/to-do-list2.png")}
                                        style={styles.icon}
                                    />

                                    {unseenTaskActionsCount > 0 && (
                                        <View style={styles.taskBadge}>
                                            <AppText style={styles.taskBadgeText}>
                                                {unseenTaskActionsCount > 99
                                                    ? "99+"
                                                    : unseenTaskActionsCount}
                                            </AppText>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            </LinearGradient>
                        </View>
                    </View>
                )}
            </View>

            {/* Модалки */}
            <SettingsModal visible={openSettings} onClose={() => setOpenSettings(false)} />
            <InfoModal visible={openInfo} onClose={() => setOpenInfo(false)} />
            <InventoryModal visible={inventoryVisible} onClose={() => setInventoryVisible(false)}/>
            <TasksModal visible={isTasksOpen} onClose={() => setIsTasksOpen(false)}/>
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
        top: 45,
        right: 30,
        backgroundColor: "rgba(255,255,255,0.9)",
        borderRadius: 8,
        paddingVertical: isTablet ? 12 : 8,
        paddingHorizontal: isTablet ? 10 : 6,
        zIndex: 10,
    },
    checkpointButton: {
        position: "absolute",
        top: 45,
        left: 110,
        backgroundColor: "rgba(255,255,255,0.93)",
        borderRadius: 8,
        paddingVertical: isTablet ? 12 : 8,
        paddingHorizontal: isTablet ? 20 : 12,
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
    iconGradient: {
        borderRadius: 7,
        padding: 3,
    },

    bottomMenuMain: {
        justifyContent: "flex-start",
        paddingHorizontal: 40,
    },
});
