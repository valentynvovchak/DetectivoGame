import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { RESOURCES } from "@/assets/resources";
import { SCALE } from "@/tools/constants";

type Props = {
    index: number;
    title: string;
    icon?: string;
    onPress: () => void;
};

export default function NotebookRow({ index, title, icon, onPress }: Props) {
    return (
        <TouchableOpacity
            style={[styles.row, {borderWidth: 3, borderColor: "#51381f", padding: 8, margin: 3,  marginBottom: 0, borderTopWidth: 0, transform: "translateY(5px)"}]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            {/* номер */}
            <View style={[styles.numberCircle]}>
                <Text style={[styles.numberText]}>{index + 1}</Text>
            </View>

            {/* иконка */}
            {icon && (
                <Image
                    source={RESOURCES[icon]}
                    style={styles.icon}
                />
            )}

            {/* текст */}
            <Text style={styles.title} numberOfLines={1}>
                {title}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(234, 199, 143, 0.9)",
        borderRadius: 16 * SCALE,
        paddingVertical: 22 * SCALE,
        paddingHorizontal: 26 * SCALE,
        marginBottom: 22 * SCALE,
    },

    numberCircle: {
        width: 60 * SCALE,
        height: 60 * SCALE,
        borderRadius: 30 * SCALE,
        borderWidth: 6 * SCALE,
        borderColor: "#2b1a0c",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 20 * SCALE,
    },

    numberText: {
        fontFamily: "BebasNeue-Regular",
        fontSize: 36 * SCALE,
        color: "#2b1a0c",
    },

    icon: {
        width: 75 * SCALE,
        height: 75 * SCALE,
        resizeMode: "contain",
        marginRight: 20 * SCALE,
    },

    title: {
        flex: 1,
        fontFamily: "Oswald-Regular",
        fontSize: 46 * SCALE,
        color: "#2b1a0c",
    },
});
