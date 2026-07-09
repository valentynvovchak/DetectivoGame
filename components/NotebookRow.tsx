import React from "react";
import { View, TouchableOpacity, Image, StyleSheet } from "react-native";
import { RESOURCES } from "@/assets/resources";
import { SCALE } from "@/tools/constants";
import AppText from "@/components/Common/AppText";

type Props = {
    index: number;
    title: string;
    icon?: string;
    onPress: () => void;
};

export default function NotebookRow({ title, icon, onPress }: Props) {
    return (
        <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.85}>
            {!!icon && (
                <View style={styles.iconWrap}>
                    <Image source={RESOURCES[icon]} style={styles.icon} />
                </View>
            )}

            <AppText style={styles.title} numberOfLines={2}>
                {title}
            </AppText>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    row: {
        minHeight: 112 * SCALE,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#183035",
        borderWidth: 3 * SCALE,
        borderColor: "#D7D3A9",
        borderRadius: 12 * SCALE,
        paddingHorizontal: 14 * SCALE,
        paddingVertical: 12 * SCALE,
        marginBottom: 16 * SCALE,
    },

    iconWrap: {
        width: 64 * SCALE,
        height: 64 * SCALE,
        borderRadius: 10 * SCALE,
        overflow: "hidden",
        backgroundColor: "#355157",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 14 * SCALE,
        flexShrink: 0,
    },

    icon: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },

    title: {
        flex: 1,
        color: "#F3E8C6",
        fontSize: 26 * SCALE,
        lineHeight: 34 * SCALE,
        fontFamily: "IBMPlexMono-Regular",
    },
});