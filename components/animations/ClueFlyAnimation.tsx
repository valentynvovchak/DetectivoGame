import React, { useEffect, useRef } from "react";
import {
    Animated,
    Easing,
    StyleSheet,
    useWindowDimensions,
    View,
} from "react-native";

import AppText from "@/components/Common/AppText";
import MixedIcon from "@/components/Common/MixedIcon";

type ClueCategory =
    | "facts"
    | "evidence"
    | "dossier"
    | "hypotheses";

interface Props {
    text: string;

    icon?: string;

    category?: ClueCategory;

    lang?: "ru" | "en";

    /**
     * Координаты центра карточки при появлении.
     */
    start: {
        x: number;
        y: number;
    };

    /**
     * Координаты центра иконки кейса.
     */
    end: {
        x: number;
        y: number;
    };

    onFinish?: () => void;
}

const CATEGORY_CONFIG: Record<
    ClueCategory,
    {
        ru: string;
        en: string;
        accent: string;
        background: string;
    }
    > = {
    facts: {
        ru: "НОВЫЙ ФАКТ",
        en: "NEW FACT",
        accent: "#E9DEC1",
        background: "#263F3E",
    },

    evidence: {
        ru: "НОВАЯ УЛИКА",
        en: "NEW EVIDENCE",
        accent: "#F1DFA7",
        background: "#263F3E",
    },

    dossier: {
        ru: "НОВОЕ ДОСЬЕ",
        en: "NEW DOSSIER",
        accent: "#D86B62",
        background: "#263F3E",
    },

    hypotheses: {
        ru: "НОВАЯ ГИПОТЕЗА",
        en: "NEW HYPOTHESIS",
        accent: "#77C7B1",
        background: "#263F3E",
    },
};

export default function ClueFlyAnimation({
     text,
     icon,
     category = "facts",
     lang = "en",
     start,
     end,
     onFinish,
 }: Props) {
    const { width: screenWidth } = useWindowDimensions();

    const cardWidth = Math.min(screenWidth * 0.68, 330);
    const cardHeight = 96;

    /*
     * Появление карточки.
     */
    const intro = useRef(new Animated.Value(0)).current;

    /*
     * Движение карточки к иконке кейса.
     */
    const flyProgress = useRef(new Animated.Value(0)).current;

    /*
     * Уменьшение во время полёта.
     */
    const flyScale = useRef(new Animated.Value(1)).current;

    /*
     * Исчезновение карточки.
     */
    const opacity = useRef(new Animated.Value(0)).current;

    /*
     * Световой блик.
     */
    const shimmer = useRef(new Animated.Value(0)).current;

    /*
     * Вспышка возле иконки кейса.
     */
    const endBurst = useRef(new Animated.Value(0)).current;

    const finishedRef = useRef(false);

    const config = CATEGORY_CONFIG[category];

    useEffect(() => {
        finishedRef.current = false;

        const animation = Animated.sequence([
            /*
             * 1. Эффект появления.
             */
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 180,
                    easing: Easing.out(Easing.quad),
                    useNativeDriver: true,
                }),

                Animated.spring(intro, {
                    toValue: 1,
                    friction: 5,
                    tension: 90,
                    useNativeDriver: true,
                }),

                Animated.timing(shimmer, {
                    toValue: 1,
                    duration: 650,
                    delay: 120,
                    easing: Easing.inOut(Easing.quad),
                    useNativeDriver: true,
                }),
            ]),

            /*
             * 2. Карточка остаётся на месте,
             * чтобы игрок успел её прочитать.
             */
            Animated.delay(750),

            /*
             * 3. Полёт в кейс.
             */
            Animated.parallel([
                Animated.timing(flyProgress, {
                    toValue: 1,
                    duration: 1100,
                    easing: Easing.inOut(Easing.cubic),
                    useNativeDriver: true,
                }),

                Animated.timing(flyScale, {
                    toValue: 0.22,
                    duration: 1100,
                    easing: Easing.in(Easing.cubic),
                    useNativeDriver: true,
                }),

                /*
                 * Карточка исчезает только
                 * ближе к концу полёта.
                 */
                Animated.sequence([
                    Animated.delay(780),

                    Animated.timing(opacity, {
                        toValue: 0,
                        duration: 320,
                        easing: Easing.in(Easing.quad),
                        useNativeDriver: true,
                    }),
                ]),

                /*
                 * Вспышка возле иконки кейса.
                 */
                Animated.sequence([
                    Animated.delay(790),

                    Animated.timing(endBurst, {
                        toValue: 1,
                        duration: 160,
                        easing: Easing.out(Easing.quad),
                        useNativeDriver: true,
                    }),

                    Animated.timing(endBurst, {
                        toValue: 2,
                        duration: 360,
                        easing: Easing.out(Easing.cubic),
                        useNativeDriver: true,
                    }),
                ]),
            ]),
        ]);

        animation.start(({ finished }) => {
            if (!finished || finishedRef.current) {
                return;
            }

            finishedRef.current = true;
            onFinish?.();
        });

        return () => {
            animation.stop();
        };
    }, []);

    /*
     * Карточка пружинно появляется.
     */
    const introScale = intro.interpolate({
        inputRange: [0, 0.65, 1],
        outputRange: [0.35, 1.1, 1],
    });

    const introTranslateY = intro.interpolate({
        inputRange: [0, 1],
        outputRange: [22, 0],
    });

    /*
     * Движение по горизонтали.
     * start/end считаются центром карточки.
     */
    const translateX = flyProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [
            start.x - cardWidth / 2,
            end.x - cardWidth / 2,
        ],
    });

    /*
     * Дуга полёта.
     */
    const translateY = flyProgress.interpolate({
        inputRange: [0, 0.3, 0.7, 1],
        outputRange: [
            start.y - cardHeight / 2,
            start.y - cardHeight / 2 - 65,
            end.y - cardHeight / 2 - 100,
            end.y - cardHeight / 2,
        ],
    });

    /*
     * Лёгкое вращение во время полёта.
     */
    const rotate = flyProgress.interpolate({
        inputRange: [0, 0.3, 0.65, 1],
        outputRange: [
            "0deg",
            "-5deg",
            "8deg",
            "0deg",
        ],
    });

    /*
     * Комбинируем появление и уменьшение.
     */
    const totalScale = Animated.multiply(
        introScale,
        flyScale
    );

    /*
     * Световой блик по карточке.
     */
    const shimmerTranslateX = shimmer.interpolate({
        inputRange: [0, 1],
        outputRange: [-cardWidth, cardWidth * 1.4],
    });

    /*
     * Вспышка у кейса.
     */
    const burstScale = endBurst.interpolate({
        inputRange: [0, 1, 2],
        outputRange: [0.3, 1, 2.2],
    });

    const burstOpacity = endBurst.interpolate({
        inputRange: [0, 0.3, 1, 2],
        outputRange: [0, 0.8, 0.8, 0],
    });

    return (
        <View
            pointerEvents="none"
            style={styles.animationRoot}
        >
            <Animated.View
                style={[
                    styles.endBurst,
                    {
                        left: end.x - 34,
                        top: end.y - 34,
                        borderColor: config.accent,
                        opacity: burstOpacity,
                        transform: [{ scale: burstScale }],
                    },
                ]}
            />

            <Animated.View
                style={[
                    styles.card,
                    {
                        width: cardWidth,
                        height: cardHeight,
                        backgroundColor: config.background,
                        borderColor: config.accent,
                        opacity,
                        transform: [
                            { translateX },
                            {
                                translateY: Animated.add(
                                    translateY,
                                    introTranslateY
                                ),
                            },
                            { scale: totalScale },
                            { rotate },
                        ],
                    },
                ]}
            >
                <View
                    style={[
                        styles.accentLine,
                        { backgroundColor: config.accent },
                    ]}
                />

                {!!icon && (
                    <View
                        style={[
                            styles.iconWrap,
                            { borderColor: config.accent },
                        ]}
                    >
                        <MixedIcon
                            icon={icon}
                            width={58}
                            height={58}
                            resizeMode="cover"
                        />
                    </View>
                )}

                <View style={styles.textContent}>
                    <AppText
                        style={[
                            styles.categoryText,
                            { color: config.accent },
                        ]}
                    >
                        {config[lang]}
                    </AppText>

                    <AppText
                        style={styles.clueText}
                        numberOfLines={2}
                    >
                        {text}
                    </AppText>
                </View>

                <Animated.View
                    style={[
                        styles.shimmer,
                        {
                            transform: [
                                { translateX: shimmerTranslateX },
                                { rotate: "18deg" },
                            ],
                        },
                    ]}
                />
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        position: "absolute",

        flexDirection: "row",
        alignItems: "center",

        borderWidth: 2,
        borderRadius: 10,

        overflow: "hidden",

        paddingHorizontal: 12,
        paddingVertical: 10,

        zIndex: 99999,
        elevation: 99999,

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.35,
        shadowRadius: 10,
    },

    accentLine: {
        position: "absolute",

        left: 0,
        top: 0,
        bottom: 0,

        width: 6,
    },

    iconWrap: {
        width: 60,
        height: 60,

        borderWidth: 1.5,
        borderRadius: 7,

        overflow: "hidden",

        marginLeft: 4,
        marginRight: 12,

        backgroundColor: "#172829",

        alignItems: "center",
        justifyContent: "center",
    },

    textContent: {
        flex: 1,
        justifyContent: "center",
    },

    categoryText: {
        marginBottom: 4,

        fontSize: 12,
        lineHeight: 15,

        fontFamily: "IBMPlexMono-Bold",

        letterSpacing: 1.1,
    },

    clueText: {
        color: "#FFFFFF",

        fontSize: 15,
        lineHeight: 19,

        fontFamily: "IBMPlexMono-Regular",
    },

    shimmer: {
        position: "absolute",

        top: -30,
        bottom: -30,

        width: 42,

        backgroundColor: "rgba(255,255,255,0.16)",
    },

    endBurst: {
        position: "absolute",

        width: 68,
        height: 68,

        borderWidth: 4,
        borderRadius: 999,

        zIndex: 99998,
        elevation: 99998,
    },

    fullscreenOverlay: {
        ...StyleSheet.absoluteFillObject,

        zIndex: 999999,
        elevation: 999999,

        overflow: "visible",
    },
    animationRoot: {
        ...StyleSheet.absoluteFillObject,

        zIndex: 999999,
        elevation: 999999,

        overflow: "visible",
    },
});