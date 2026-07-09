import React from "react";
import {
    Modal,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
    Image,
} from "react-native";

import AppText from "@/components/Common/AppText";
import { tasksData } from "@/data/tasks";
import { useGameStore } from "@/store/gameStore";
import { SCALE as scale } from "@/tools/constants";
import {height} from "@/styles/global";

const SCALE = scale * 3

type TasksModalProps = {
    visible: boolean;
    onClose: () => void;
};

export default function TasksModal({ visible, onClose }: TasksModalProps) {
    const lang = useGameStore((state) => state.lang);
    const activeTasks = useGameStore((state) => state.activeTasks);
    const completedTasks = useGameStore((state) => state.completedTasks);

    const hasTasks = activeTasks.length > 0 || completedTasks.length > 0;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.panel}>
                    <View style={styles.titleWrapper}>
                        <AppText style={styles.title}>{lang == 'ru' ? 'ЗАДАЧИ' : 'TASKS'}</AppText>
                    </View>

                    <ScrollView
                        style={styles.scroll}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {!hasTasks && (
                            <AppText style={styles.emptyText}>
                                {lang == 'ru' ? 'Нет активных задач.' : 'No active tasks.'}
                            </AppText>
                        )}

                        {activeTasks.map((taskId) => {
                            const task = tasksData[taskId];

                            if (!task) return null;

                            return (
                                <View key={taskId} style={styles.taskCard}>
                                    <View style={styles.checkbox} />

                                    <AppText style={styles.taskText}>
                                        {task.title[lang] || task.title.en}
                                    </AppText>
                                </View>
                            );
                        })}

                        {completedTasks.map((taskId) => {
                            const task = tasksData[taskId];

                            if (!task) return null;

                            return (
                                <View
                                    key={taskId}
                                    style={[
                                        styles.taskCard,
                                        styles.completedTaskCard,
                                    ]}
                                >
                                    <View style={styles.completedCheckbox}>
                                        <AppText style={styles.checkMark}>
                                            ✓
                                        </AppText>
                                    </View>

                                    <AppText
                                        style={[
                                            styles.taskText,
                                            styles.completedTaskText,
                                        ]}
                                    >
                                        {task.title[lang] || task.title.en}
                                    </AppText>
                                </View>
                            );
                        })}
                    </ScrollView>

                    {/*<TouchableOpacity*/}
                    {/*    style={styles.backButton}*/}
                    {/*    activeOpacity={0.8}*/}
                    {/*    onPress={onClose}*/}
                    {/*>*/}
                    {/*    <AppText style={styles.backText}>back</AppText>*/}
                    {/*</TouchableOpacity>*/}

                    <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                        <AppText style={styles.closeBtnText}>{lang == 'ru' ? 'назад': 'back'}</AppText>
                        <Image source={require("../../assets/icons/triangle-left.png")} style={styles.icon} />
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.45)",
        paddingTop: 0.1 * height,
        paddingHorizontal: 8 * SCALE,
        paddingBottom: 0.3 * height,
    },

    panel: {
        flex: 1,
        borderWidth: 1.5 * SCALE,
        borderColor: "#E9DEC1",
        backgroundColor: "rgba(19, 48, 48, 0.82)",
        paddingHorizontal: 16 * SCALE,
        paddingTop: 20 * SCALE,
        paddingBottom: 18 * SCALE,
        borderRadius: 7 * SCALE
    },

    titleWrapper: {
        alignSelf: "center",
        borderWidth: 1.5 * SCALE,
        borderColor: "#E9DEC1",
        borderRadius: 4 * SCALE,
        paddingHorizontal: 18 * SCALE,
        paddingVertical: 6 * SCALE,
        marginBottom: 26 * SCALE,
        backgroundColor: "rgba(10, 20, 22, 0.55)",
    },

    title: {
        color: "#E9DEC1",
        fontSize: 17 * SCALE,
        letterSpacing: 1,
        textAlign: "center",
    },

    scroll: {
        flex: 1,
    },

    scrollContent: {
        paddingBottom: 24 * SCALE,
    },

    taskCard: {
        minHeight: 46 * SCALE,
        borderWidth: 1.4 * SCALE,
        borderColor: "#E9DEC1",
        borderRadius: 5 * SCALE,
        paddingVertical: 9 * SCALE,
        paddingHorizontal: 9 * SCALE,
        marginBottom: 10 * SCALE,
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: "rgba(16, 34, 38, 0.68)",
    },

    completedTaskCard: {
        opacity: 0.58,
    },

    checkbox: {
        width: 22 * SCALE,
        height: 22 * SCALE,
        borderWidth: 1.2 * SCALE,
        borderColor: "#E9DEC1",
        borderRadius: 5 * SCALE,
        marginRight: 10 * SCALE,
        marginTop: 1 * SCALE,
        backgroundColor: "rgba(0, 0, 0, 0.15)",
    },

    completedCheckbox: {
        width: 22 * SCALE,
        height: 22 * SCALE,
        borderWidth: 1.2 * SCALE,
        borderColor: "#E9DEC1",
        borderRadius: 5 * SCALE,
        marginRight: 10 * SCALE,
        marginTop: 1 * SCALE,
        backgroundColor: "rgba(233, 222, 193, 0.18)",
        alignItems: "center",
        justifyContent: "center",
    },

    checkMark: {
        color: "#E9DEC1",
        fontSize: 14 * SCALE,
        lineHeight: 16 * SCALE,
    },

    taskText: {
        flex: 1,
        color: "#F2EAD0",
        fontSize: 10.5 * SCALE,
        lineHeight: 15 * SCALE,
    },

    completedTaskText: {
        textDecorationLine: "line-through",
        color: "#BFB59D",
    },

    emptyText: {
        color: "#E9DEC1",
        fontSize: 13 * SCALE,
        textAlign: "center",
        marginTop: 20 * SCALE,
        opacity: 0.8,
    },

    backButton: {
        alignSelf: "flex-start",
        borderWidth: 1.2 * SCALE,
        borderColor: "#E9DEC1",
        paddingHorizontal: 14 * SCALE,
        paddingVertical: 8 * SCALE,
        backgroundColor: "rgba(20, 22, 25, 0.65)",
    },

    backText: {
        color: "#F2EAD0",
        fontSize: 13 * SCALE,
    },

    closeBtn: {
        position: 'absolute',
        left: 80 * scale,
        bottom: -190 * scale,
        zIndex: 100,
        // width: 63 * SCALE,
        // height: 63 * SCALE,
        paddingVertical: 28 * scale,
        paddingHorizontal: 46 * scale,
        borderRadius: 18 * scale,
        backgroundColor: "#494949",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 3 * scale,
        borderColor: "#FFFFFF",
    },

    closeBtnText: {
        color: "#FFFFFF",
        fontSize: 42 * scale,
        // fontFamily: "IBMPlexMono-Bold",
    },

    icon: {
        position: "absolute",
        height: 110 * scale,
        width: 79 * scale,
        top: 0,
        left: -90 * scale
    },
});