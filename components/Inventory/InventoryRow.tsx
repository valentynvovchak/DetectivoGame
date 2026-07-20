import React from "react";
import { View, TouchableOpacity, Image, StyleSheet } from "react-native";
import { RESOURCES } from "@/assets/resources";
import { SCALE } from "@/tools/constants";
import AppText from "@/components/Common/AppText";
import {LinearGradient} from "expo-linear-gradient";
import SVGImage from "@/components/small/SVGImage";
import {getSprite} from "@/tools/utils";
import MixedIcon from "@/components/Common/MixedIcon";

type Props = {
    index: number;
    title: string;
    icon?: string;
    onPress: () => void;
    active?: boolean;
};

export default function InventoryRow({
         title,
         icon,
         sprite,
         bg,
         onPress,
         active = false,
     }: Props) {
    return (
        <LinearGradient
            colors={["#CCCCCC", "#CACA99"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }} // сверху вниз
            style={{
                // alignSelf: "flex-start",
                borderRadius: 24 * SCALE,
                padding: 6 * SCALE, // ← толщина рамки
                marginBottom: 30 * SCALE
                // width: '100%',
                // height: '66%',
                // marginBottom: 600 * SCALE,
            }}
        >
        <TouchableOpacity
            style={[styles.row, active && styles.rowActive]}
            onPress={onPress}
            activeOpacity={0.85}
        >
            {/*{!!icon && (
                <View style={styles.iconWrap}>
                    <Image source={RESOURCES[icon]} style={styles.icon} />
                </View>
            )}*/}
            {!!icon && (
                <View style={styles.iconWrap}>
                    <MixedIcon
                        icon={icon}
                        width={158 * SCALE}
                        height={158 * SCALE}
                        resizeMode="cover"
                    />
                </View>
            )}
            {!!sprite && (
                <View style={[styles.iconWrap, {backgroundColor: bg}]}>
                    <SVGImage
                        Image={getSprite(sprite)}
                        height={190 * 3 * SCALE}
                        width={85 * 3 * SCALE}
                        style={styles.spriteIcon}
                    />
                </View>
            )}

            <View style={styles.textWrap}>
                <AppText style={styles.title} numberOfLines={3}>
                    {title}
                </AppText>
            </View>
        </TouchableOpacity></LinearGradient>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        alignItems: "flex-start",
        minHeight: 168 * SCALE,
        backgroundColor: "#1B2A2D",
        // borderWidth: 9 * SCALE,
        // borderColor: "#D2D0A7",
        borderRadius: 24 * SCALE,
        paddingHorizontal: 12 * SCALE,
        paddingVertical: 10 * SCALE,
        // marginBottom: 30 * SCALE,
    },

    rowActive: {
        backgroundColor: "#21363A",
    },

    iconWrap: {
        // borderColor: '#FFFAFA',
        borderWidth: 3 * SCALE,
        borderStyle: 'solid',
        borderBottomEndRadius: 24 * SCALE,
        borderBottomStartRadius: 24 * SCALE,
        borderTopEndRadius: 24 * SCALE,
        borderTopStartRadius: 24 * SCALE,
        width: 158 * SCALE,
        height: 158 * SCALE,
        borderRadius: 8 * SCALE,
        overflow: "hidden",
        marginRight: 16 * SCALE,
        // marginVertical: 8 * SCALE,
    },

    icon: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },

    textWrap: {
        paddingVertical: 15 * SCALE,
        paddingHorizontal: 10 * SCALE,
        flex: 1,
    },

    title: {
        color: "#F7EFE4",
        fontFamily: "IBMPlexMono-Regular",
        fontSize: 38 * SCALE,
        lineHeight: 45 * SCALE,
    },
    spriteIcon: {
        transform: [
            {translateX: -50 * SCALE}
        ]
    },
});