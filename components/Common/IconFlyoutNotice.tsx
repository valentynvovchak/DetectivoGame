import React, { useEffect, useRef } from "react";
import {Animated, Platform, StyleSheet, View, ViewStyle} from "react-native";

import AppText from "@/components/Common/AppText";
import { useGameStore } from "@/store/gameStore";
import { SCALE as scale } from "@/tools/constants";
import {isSmallScreen} from "@/styles/global";

const SCALE = scale * 3;

type NoticeSource = "tasks" | "briefcase";

type IconFlyoutNoticeProps = {
    source: NoticeSource;
    style?: ViewStyle;
};

const NOTICE_TEXT: Record<string, { ru: string; en: string }> = {
    new_task: {
        ru: "новая задача!",
        en: "new task!",
    },
    task_completed: {
        ru: "задача выполнена!",
        en: "task completed!",
    },
    new_fact: {
        ru: "новый факт!",
        en: "new fact!",
    },
    new_dossier: {
        ru: "новый персонаж!",
        en: "new character!",
    },
    new_evidence: {
        ru: "новая улика!",
        en: "new evidence!",
    },
    new_hypothesis: {
        ru: "новая гипотеза!",
        en: "new hypothesis!",
    },
};

export default function IconFlyoutNotice({
         source,
         style,
     }: IconFlyoutNoticeProps) {
    const lang = useGameStore((state) => state.lang);
    const notices = useGameStore((state) => state.uiNotices);
    const removeUiNotice = useGameStore((state) => state.removeUiNotice);

    const notice = notices.find((item) => item.source === source);

    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(22 * SCALE)).current;
    const scale = useRef(new Animated.Value(0.96)).current;

    const currentNoticeIdRef = useRef<number | null>(null);

    useEffect(() => {
        if (!notice) return;

        if (currentNoticeIdRef.current === notice.id) return;

        currentNoticeIdRef.current = notice.id;

        opacity.setValue(0);
        translateY.setValue(22 * SCALE);
        scale.setValue(0.96);

        Animated.sequence([
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 2200,
                    useNativeDriver: true,
                }),
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 260,
                    useNativeDriver: true,
                }),
                Animated.timing(scale, {
                    toValue: 1,
                    duration: 260,
                    useNativeDriver: true,
                }),
            ]),

            Animated.delay(1100),

            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 220,
                    useNativeDriver: true,
                }),
                Animated.timing(translateY, {
                    toValue: -12 * SCALE,
                    duration: 220,
                    useNativeDriver: true,
                }),
            ]),
        ]).start(() => {
            removeUiNotice(notice.id);
        });
    }, [notice?.id]);

    if (!notice) return null;

    return (
        <Animated.View
            pointerEvents="none"
            style={[
                styles.notice,
                style,
                {
                    opacity,
                    transform: [{ translateY }, { scale }],
                },
            ]}
        >
            <AppText style={styles.noticeText}>
                {NOTICE_TEXT[notice.kind]?.[lang] || notice.kind}
            </AppText>

            <View style={styles.tail} />
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    notice: {
        position: "absolute",
        bottom: isSmallScreen ? 85 * SCALE : Platform.OS ==='ios' ? 75 * SCALE : 55 * SCALE,
        // left: isSmallScreen ? -54 * SCALE : -74 * SCALE,
        left: isSmallScreen ? -54 * SCALE : Platform.OS ==='ios' ? -34 * SCALE : -46 * SCALE,

        minWidth: 120 * SCALE,
        paddingHorizontal: 14 * SCALE,
        paddingVertical: 8 * SCALE,
        // marginRight: 3 * SCALE,

        borderRadius: 5 * SCALE,
        borderWidth: 1.2 * SCALE,
        borderColor: "#3F8C46",
        backgroundColor: "rgba(40, 57, 50, 0.94)",

        alignItems: "center",
        justifyContent: "center",

        zIndex: 9999,
        elevation: 9999,
        overflow: "visible",
    },

    noticeText: {
        color: "#F4EAD0",
        fontSize: 12 * SCALE,
        lineHeight: 15 * SCALE,
        textAlign: "center",
        fontFamily: "IBMPlexMono-Regular",
    },

    tail: {
        position: "absolute",

        width: 18 * SCALE,
        height: 18 * SCALE,

        bottom: -9.5 * SCALE,
        left: "70%",
        marginLeft: -9 * SCALE,

        backgroundColor: "rgba(40, 57, 50, 0.94)",

        borderRightWidth: 1.2 * SCALE,
        borderBottomWidth: 1.2 * SCALE,
        borderColor: "#3F8C46",

        transform: [{ rotate: "45deg" }],

        zIndex: 9998,
    },
});