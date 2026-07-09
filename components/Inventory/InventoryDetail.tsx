import React from "react";
import {View, TouchableOpacity, Image, ScrollView, StyleSheet, Platform} from "react-native";
import { RESOURCES } from "@/assets/resources";
import { SCALE } from "@/tools/constants";
import AppText from "@/components/Common/AppText";
import SVGImage from "@/components/small/SVGImage";
import { getSprite } from "@/tools/utils";
import {isSmallScreen, isTablet} from "@/styles/global";

const K = SCALE * 3;

type TabKey = "facts" | "dossier" | "evidence" | "hypotheses";

export default function InventoryDetail({
        tab,
        item,
        index,
        onBack,
        lang,
    }: {
    tab: TabKey;
    item: any;
    index: number;
    onBack: () => void;
    lang: "ru" | "en";
}) {
    const isDossier = tab === "dossier";

    const label =
        tab === "facts"
            ? lang === "ru" ? "ФАКТ" : "FACT"
            : tab === "evidence"
                ? lang === "ru" ? "УЛИКА" : "EVIDENCE"
                : tab === "dossier"
                    ? lang === "ru" ? "ДОСЬЕ" : "DOSSIER"
                    : lang === "ru" ? "ГИПОТЕЗА" : "HYPOTHESIS";

    return (
        <View
            style={styles.root}
            contentContainerStyle={styles.content}
            // showsVerticalScrollIndicator={false}
        >
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
                <AppText style={styles.backText}>{lang === "ru" ? "← назад" : "← back"}</AppText>
            </TouchableOpacity>

            <View style={styles.mainCard}>
                <View style={styles.mainCard}>
                    <View style={styles.sectionHeader}>
                        <AppText style={styles.sectionHeaderText}>
                            {isDossier
                                ? lang === "ru" ? "ОПИСАНИЕ ДОСЬЕ" : "DOSSIER DESCRIPTION"
                                : lang === "ru" ? "ОПИСАНИЕ НАХОДОК" : "FINDING DESCRIPTION"}
                        </AppText>
                    </View>

                    <View style={styles.findingRow}>
                        <View style={styles.findingLeft}>
                            <View style={[styles.bigImageBox, {backgroundColor: item?.appearance?.bg || 'null'}]}>
                                {isDossier && item.appearance?.sprite ? (
                                    <SVGImage Image={getSprite(item.appearance.sprite)} width={115 * 3 * SCALE} height={265 * 3 * SCALE} style={styles.portrait} />
                                ) : item.icon ? (
                                    <Image source={RESOURCES[item.icon]} style={styles.mainImage} />
                                ) : (
                                    <View style={styles.imagePlaceholder} />
                                )}

                                <View style={styles.badge}>
                                    <AppText style={styles.badgeText}>{index + 1}</AppText>
                                </View>
                            </View>

                            <AppText style={styles.itemNameLeft} numberOfLines={6}>
                                {item.name}
                            </AppText>
                        </View>

                        <ScrollView
                            style={styles.paperScroll}
                            contentContainerStyle={styles.paperContent}
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.paperInner}>
                                <View style={styles.paperLines}>
                                    {Array.from({ length: 20 }).map((_, i) => (
                                        <View key={i} style={styles.paperLine} />
                                    ))}
                                </View>

                                <AppText style={[styles.descriptionText, {lineHeight: !((Platform.OS === 'ios') || (isSmallScreen))? 15.1 * K: 16.1 * K,}]}>
                                    {isDossier ? item.description : `${item.description || ""}`}
                                </AppText>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },

    backText: {
        color: "#F4E8BD",
        fontSize: 12 * K,
        fontFamily: "IBMPlexMono-Regular",
    },

    mainImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },

    imagePlaceholder: {
        width: "70%",
        height: "70%",
        borderRadius: 4 * K,
        backgroundColor: "#6E766A",
        opacity: 0.55,
    },

    portrait: {
        transform: [
            // { scale: 0.44 * K },
            { translateY: 95 * K },
        ],
    },

    badge: {
        position: "absolute",
        left: -4 * K,
        top: -3 * K,
        width: 18 * K,
        height: 18 * K,
        borderRadius: 11 * K,
        borderWidth: 1.5 * K,
        borderColor: "#E8D99A",
        backgroundColor: "#2A2F2F",
        justifyContent: "center",
        alignItems: "center",
    },

    badgeText: {
        color: "#F4E8BD",
        fontSize: 10 * K,
        fontFamily: "IBMPlexMono-Bold",
    },

    topText: {
        flex: 1,
        paddingTop: 4 * K,
    },

    label: {
        color: "#E8D99A",
        fontSize: 10 * K,
        marginBottom: 5 * K,
        fontFamily: "IBMPlexMono-Regular",
    },


    subtitle: {
        color: "#F4E8BD",
        fontSize: 9 * K,
        lineHeight: 14 * K,
        marginTop: 7 * K,
        fontFamily: "IBMPlexMono-Regular",
    },

    status: {
        color: "#E8D99A",
        fontSize: 8.5 * K,
        lineHeight: 13 * K,
        marginTop: 4 * K,
        fontFamily: "IBMPlexMono-Regular",
    },

    divider: {
        height: 1.3 * K,
        backgroundColor: "rgba(232,217,154,0.5)",
        marginVertical: 12 * K,
    },

    descriptionBlock: {
        marginBottom: 12 * K,
    },

    blockTitle: {
        color: "#E8D99A",
        fontSize: 12 * K,
        marginBottom: 7 * K,
        fontFamily: "IBMPlexMono-Bold",
    },


    // paperLines: {
    //     ...StyleSheet.absoluteFillObject,
    //     paddingHorizontal: 14 * K,
    //     paddingTop: 20 * K,
    // },
    //
    // paperLine: {
    //     height: K,
    //     backgroundColor: "rgba(31,46,47,0.35)",
    //     marginBottom: 16 * K,
    // },

    bottomNotes: {
        marginTop: 4 * K,
    },

    noteBox: {
        borderWidth: 1.2 * K,
        borderColor: "rgba(232,217,154,0.65)",
        borderRadius: 6 * K,
        padding: 10 * K,
        backgroundColor: "rgba(5,17,19,0.35)",
    },

    noteText: {
        color: "#F4E8BD",
        fontSize: 9.5 * K,
        lineHeight: 15 * K,
        fontFamily: "IBMPlexMono-Regular",
    },
    content: {
        paddingHorizontal: 8 * K,
        // paddingTop: 14 * K,
        paddingBottom: 42 * K,
    },

    backButton: {
        alignSelf: "flex-start",
        marginLeft: 0,
        marginBottom: 8 * K,
        paddingHorizontal: 10 * K,
        paddingVertical: 5 * K,
        borderRadius: 4 * K,
        borderWidth: 1.5 * K,
        borderColor: "#E8D99A",
        backgroundColor: "#102426",
    },

    topBlock: {
        flexDirection: "row",
        minHeight: 95 * K,
    },

    title: {
        color: "#F4E8BD",
        fontSize: 20 * K,
        lineHeight: 27 * K,
        fontFamily: "IBMPlexMono-Bold",
        textTransform: "uppercase",
    },

    mainCard: {
        width: "100%",
        borderWidth: 1.8 * K,
        borderColor: "#263738",
        borderRadius: 8 * K,
        backgroundColor: "#102426",
        // minHeight: 260 * K,
        overflow: "hidden",
    },

    sectionHeader: {
        paddingVertical: 10 * K,
        borderBottomWidth: 1.3 * K,
        borderBottomColor: "rgba(232,217,154,0.35)",
        backgroundColor: "#13292B",
        alignItems: "center",
    },

    sectionHeaderText: {
        color: "#E8D99A",
        fontSize: 16 * K,
        lineHeight: 20 * K,
        fontFamily: "IBMPlexMono-Regular",
        textTransform: "uppercase",
    },

    findingRow: {
        flexDirection: "row",
        padding: 12 * K,
        gap: 14 * K,
    },

    findingLeft: {
        width: 92 * K,
        alignItems: "center",
    },

    bigImageBox: {
        width: 78 * K,
        height: 78 * K,
        borderRadius: 6 * K,
        borderWidth: 2 * K,
        borderColor: "#6E766A",
        // backgroundColor: "red",
        overflow: "hidden",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8 * K,
    },

    itemNameLeft: {
        color: "#E8D99A",
        fontSize: 12 * K,
        lineHeight: 15 * K,
        textAlign: "center",
        fontFamily: "IBMPlexMono-Regular",
        textTransform: "uppercase",
    },

    paper: {
        flex: 1,
        minHeight: 132 * K,
        borderRadius: 6 * K,
        backgroundColor: "#C9D4D0",
        paddingHorizontal: 14 * K,
        paddingVertical: 6 * K,
        overflow: "hidden",
        maxHeight: 500 * SCALE
    },

    // descriptionText: {
    //     color: "#182323",
    //     fontSize: 10.5 * K,
    //     lineHeight: 17 * K,
    //     fontFamily: "IBMPlexMono-Regular",
    // },

    paperScroll: {
        flex: 1,
        maxHeight: 190 * K,
        borderRadius: 6 * K,
        backgroundColor: "#C9D4D0",
    },

    paperContent: {
        minHeight: 150 * K,
    },

    paperInner: {
        minHeight: 150 * K,
        paddingHorizontal: 14 * K,
        paddingVertical: 12 * K,
        overflow: "hidden",
    },

    paperLines: {
        ...StyleSheet.absoluteFillObject,
        paddingHorizontal: 14 * K,
        paddingTop: 27 * K,
    },

    paperLine: {
        height: 1.1 * K,
        backgroundColor: "rgba(31,46,47,0.35)",
        marginBottom: 15 * K,
    },

    descriptionText: {
        color: "#182323",
        fontSize: 10.5 * K,
        fontFamily: "IBMPlexMono-Regular",
    },
});