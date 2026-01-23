import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { width, height } from "@/styles/global";
import {isSmallScreen, isTablet} from "@/styles/global";

interface AddModalProps {
    toggle: (value: boolean) => void;
    onAdd?: () => void;
    text?: string;
    position?: { x: number; y: number; width?: number; height?: number };
}

export default function AddModal({
         toggle,
         onAdd,
         name,
         lang,
         position,
         // position = { x: 0.4, y: 0.75, width: 0.5, height: 0.2 },
     }: AddModalProps) {
    return (
        <View
            style={[
                styles.modal,
                {
                    left: width * position.x,
                    top: height * position.y,
                    width: width * (position.width),
                    height: height * (position.height),
                },
            ]}
        >
            <Text style={styles.itemText}>{name}</Text>
            <Text style={styles.text}>{lang == 'ru' ? 'Добавить предмет в инвентарь?': 'Add item to inventory?'}</Text>

            <View style={styles.buttons}>
                <TouchableOpacity
                    style={[styles.button, styles.yes]}
                    onPress={() => {
                        onAdd?.();
                        toggle(false);
                    }}
                >
                    <Text style={styles.btnText}>{lang == 'ru' ? 'Да': 'Yes'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, styles.no]}
                    onPress={() => toggle(false)}
                >
                    <Text style={styles.btnText}>{lang == 'ru' ? 'Нет': 'No'}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    modal: {
        position: "absolute",
        backgroundColor: "#FFEE7D",
        borderColor: "#418AFE",
        borderWidth: 2,
        borderRadius: 8,
        padding: 10,
        alignItems: "center",
        justifyContent: "space-around",
        shadowColor: "#418AFE",
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 4,
    },
    itemText: {
        fontSize: isTablet ? 25 : isSmallScreen ? 16 : 19,
        fontWeight: "600",
        color: "#444",
    },
    text: {
        fontSize: isTablet ? 22 : isSmallScreen ? 15 : 19,
        color: "#222",
        textAlign: "center",
        marginVertical: 4,
    },
    buttons: {
        flexDirection: "row",
        gap: isTablet ? 70 : isSmallScreen ? 20 : 50,
    },
    button: {
        borderRadius: 6,
        paddingVertical: 5,
        paddingHorizontal: 15,
    },
    yes: {
        backgroundColor: "#3a8ef6",
    },
    no: {
        backgroundColor: "#e33",
    },
    btnText: {
        fontSize: isTablet ? 22 : isSmallScreen ? 15 : 19,
        // padding: isTablet ? 7 : isSmallScreen ? 3 : 5,
        color: "#fff",
        fontWeight: "600",
    },
});
