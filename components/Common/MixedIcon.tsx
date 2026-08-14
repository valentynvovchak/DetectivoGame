import React from "react";
import {
    Image,
    ImageStyle,
    StyleProp,
    View,
    ViewStyle,
} from "react-native";

import { RESOURCES } from "@/assets/resources";
import { SVG_RESOURCES } from "@/assets/resources/svg_index";

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

    /*
     * КРИТИЧЕСКИ ВАЖНО:
     * SVG никогда не пытаемся искать в RESOURCES.
     */
    if (icon.toLowerCase().endsWith(".svg")) {
        return null;
    }

    if (icon.toLowerCase().endsWith(".png")) {
        return (RESOURCES as any)[icon] ?? null;
    }

    return (
        (RESOURCES as any)[icon] ??
        (RESOURCES as any)[`${icon}.png`] ??
        null
    );
};

const getSvgResource = (icon?: string) => {
    if (!icon) return null;

    /*
     * PNG никогда не пытаемся искать
     * среди SVG-компонентов.
     */
    if (icon.toLowerCase().endsWith(".png")) {
        return null;
    }

    if (icon.toLowerCase().endsWith(".svg")) {
        return (SVG_RESOURCES as any)[icon] ?? null;
    }

    return (
        (SVG_RESOURCES as any)[icon] ??
        (SVG_RESOURCES as any)[`${icon}.svg`] ??
        null
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
    if (!icon) {
        return null;
    }

    const isSvg =
        icon.toLowerCase().endsWith(".svg");

    /*
     * Если в JSON явно .svg —
     * сразу идём только в SVG_RESOURCES.
     */
    if (isSvg) {
        const SvgIcon = getSvgResource(icon);

        if (!SvgIcon) {
            console.warn(
                "❌ SVG icon not found:",
                icon
            );

            return null;
        }

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

    /*
     * Обычная PNG.
     */
    const pngSource =
        getPngResource(icon);

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

    /*
     * Поддержка старых записей без расширения:
     *
     * icon: "something"
     *
     * Если PNG не нашли — пробуем SVG.
     */
    const SvgIcon =
        getSvgResource(icon);

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

    console.warn(
        "❌ MixedIcon resource not found:",
        icon
    );

    return null;
}

/*
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
}*/
