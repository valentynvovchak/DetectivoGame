import React from "react";
import {
    Image,
    ImageStyle,
    StyleProp,
    View,
    ViewStyle,
} from "react-native";

import { RESOURCES } from "@/assets/resources";
import {SVG_RESOURCES} from "@/assets/resources/svg_index";

type Props = {
    icon?: string;
    width: number;
    height: number;
    resizeMode?: "cover" | "contain";
    imageStyle?: StyleProp<ImageStyle>;
    containerStyle?: StyleProp<ViewStyle>;
};

const getPngResource = (icon?: string) => {
    if (!icon) return null;

    return (
        (RESOURCES as any)[icon] ||
        (RESOURCES as any)[`${icon}.png`]
    );
};

const getSvgResource = (icon?: string) => {
    if (!icon) return null;

    return (
        (SVG_RESOURCES as any)[icon] ||
        (SVG_RESOURCES as any)[`${icon}.svg`]
    );
};

export default function MixedIcon({
          icon,
          width,
          height,
          resizeMode = "cover",
          imageStyle,
          containerStyle,
      }: Props) {
    const pngSource = getPngResource(icon);
    const SvgIcon = getSvgResource(icon);

    if (pngSource) {
        return (
            <Image
                source={pngSource}
                style={[
                    {
                        width,
                        height,
                        resizeMode,
                    },
                    imageStyle,
                ]}
            />
        );
    }

    if (SvgIcon) {
        return (
            <View
                style={[
                    {
                        width,
                        height,
                        overflow: "hidden",
                        alignItems: "center",
                        justifyContent: "center",
                    },
                    containerStyle,
                ]}
            >
                <SvgIcon
                    width={width}
                    height={height}
                />
            </View>
        );
    }

    return null;
}