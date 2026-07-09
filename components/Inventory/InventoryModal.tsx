import React, { useEffect, useMemo, useState } from "react";
import {
    Modal,
    View,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    useWindowDimensions,
    Image,
    ImageBackground,
} from "react-native";
import { useGameStore } from "@/store/gameStore";
import factsData from "@/data/facts.json";
import dossierData from "@/data/dossier.json";
import evidenceData from "@/data/evidence.json";
import hypothesesData from "@/data/hypotheses.json";
import AppText from "@/components/Common/AppText";
import InventoryRow from "@/components/Inventory/InventoryRow";
import InventoryDetail from "@/components/Inventory/InventoryDetail";
import { SCALE } from "@/tools/constants";
import {getBackground, getSprite} from "@/tools/utils";
import {globalStyles, height, isSmallScreen} from "@/styles/global";
import {LinearGradient} from "expo-linear-gradient";
import SVGImage from "@/components/small/SVGImage";

type TabKey = "facts" | "dossier" | "evidence" | "hypotheses";

export default function InventoryModal({
        visible,
        onClose,
    }: {
    visible: boolean;
    onClose: () => void;
}) {
    const { data, lang, clearNewItems } = useGameStore();
    const { width, height } = useWindowDimensions();

    const isWide = width >= 900;

    const [activeTab, setActiveTab] = useState<TabKey>("facts");
    const [selectedItem, setSelectedItem] = useState<any | null>(null);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    useEffect(() => {
        if (visible) {
            clearNewItems();
        }
    }, [visible]);

    const tabs = [
        { key: "facts", label: lang === "ru" ? "ФАКТЫ" : "FACTS" },
        { key: "dossier", label: lang === "ru" ? "ДОСЬЕ" : "DOSSIER" },
        { key: "evidence", label: lang === "ru" ? "УЛИКИ" : "EVIDENCE" },
        { key: "hypotheses", label: lang === "ru" ? "ГИПОТЕЗЫ" : "HYPOTHESES" },
    ];

    const tabDescriptions: Partial<Record<TabKey, { ru: string; en: string }>> = {
        hypotheses: {
            ru: "*ГИПОТЕЗЫ — выводы, основанные на нескольких фактах или утверждениях",
            en: "*HYPOTHESES - conclusions based on several facts or statements",
        },
    };

    const getList = () => {
        switch (activeTab) {
            case "facts":
                return (data.facts || []).map((id: string) => factsData[id]);
            case "dossier":
                return (data.dossier || []).map((id: string) => dossierData[id][lang]);
            case "evidence":
                return (data.evidence || []).map((id: string) => evidenceData[id][lang]);
            case "hypotheses":
                return (data.hypotheses || []).map((id: string) => hypothesesData[id][lang]);
            default:
                return [];
        }
    };

    const list = useMemo(() => getList(), [activeTab, data, lang]);

    const tItem = (item: any, lang: "ru" | "en") => {
        const tr = item?.[lang] ?? {};

        return {
            name: item?.short_description ?? tr.name ?? item?.name ?? item?.title ?? (lang === "ru" ? "Без названия" : "Untitled"),
            icon: tr.icon ?? item?.icon,
            description: tr.description ?? item?.description ?? "",
            occupation: tr.occupation ?? item?.occupation ?? "",
            status: tr.status ?? item?.status ?? "",
            appearance: item?.appearance ?? null,
        };
    };

    const handleTabChange = (tab: TabKey) => {
        setActiveTab(tab);
        setSelectedItem(null);
        setSelectedIndex(null);
    };

    const handleSelect = (item: any, idx: number) => {
        setSelectedItem(tItem(item, lang));
        setSelectedIndex(idx);
    };

    const handleBack = () => {
        setSelectedItem(null);
        setSelectedIndex(null);
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onShow={clearNewItems}>
            <ImageBackground
                source={getBackground("inventory_bg")}
                style={[globalStyles.screen]}
                resizeMode="cover"
            >
                <LinearGradient
                    colors={["#CCCCCC", "#CACA99"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={styles.inventoryFrame}
                >
                    <View style={styles.panel}>
                        <View style={styles.tabs}>
                            {tabs.map((tab) => (
                                <LinearGradient
                                    key={tab.key}
                                    colors={["#CCCCCC", "#CACA99"]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 0, y: 1 }}
                                    style={styles.tabBorder}
                                >
                                    <TouchableOpacity
                                        onPress={() => handleTabChange(tab.key as TabKey)}
                                        style={[
                                            styles.tab,
                                            activeTab === tab.key && styles.activeTab,
                                        ]}
                                    >
                                        <AppText
                                            style={[
                                                styles.tabText,
                                                activeTab === tab.key && styles.activeTabText,
                                            ]}
                                        >
                                            {tab.label}
                                        </AppText>
                                    </TouchableOpacity>
                                </LinearGradient>
                            ))}
                        </View>

                        {tabDescriptions[activeTab] && (
                            <LinearGradient
                                colors={["#CCCCCC", "#CACA99"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 0, y: 1 }}
                                style={styles.tabDescriptionGradient}
                            >
                                <View style={styles.tabDescription}>
                                    <AppText style={styles.tabDescriptionText}>
                                        {tabDescriptions[activeTab]?.[lang]}
                                    </AppText>
                                </View>
                            </LinearGradient>
                        )}

                        <View style={styles.mobileBody}>
                            {selectedIndex === null || !selectedItem ? (
                                <ScrollView
                                    style={styles.mobileList}
                                    contentContainerStyle={styles.listContent}
                                    showsVerticalScrollIndicator={false}
                                >
                                    {list.length === 0 ? (
                                        <AppText style={styles.emptyText}>
                                            {lang === "ru" ? "Пока ничего нет..." : "Nothing yet..."}
                                        </AppText>
                                    ) : (
                                        list.map((item: any, idx: number) => {
                                            const it = tItem(item, lang);

                                            return (
                                                <InventoryRow
                                                    key={idx}
                                                    index={idx}
                                                    title={it.name}
                                                    icon={it?.icon}
                                                    sprite={it?.appearance?.sprite}
                                                    bg={it?.appearance?.bg}
                                                    onPress={() => handleSelect(item, idx)}
                                                />
                                            );
                                        })
                                    )}
                                </ScrollView>
                            ) : (
                                <InventoryDetail
                                    tab={activeTab}
                                    item={selectedItem}
                                    index={selectedIndex}
                                    onBack={handleBack}
                                    lang={lang}
                                />
                            )}
                        </View>
                    </View>
                </LinearGradient>

                <TouchableOpacity
                    style={[
                        styles.closeBtn,
                        {
                            left: width * 0.12,
                            top: height * 0.64,
                        },
                    ]}
                    onPress={onClose}
                >
                    <AppText style={styles.closeBtnText}>
                        {lang === "ru" ? "назад" : "back"}
                    </AppText>

                    <Image
                        source={require("../../assets/icons/triangle-left.png")}
                        style={styles.backArrow}
                    />
                </TouchableOpacity>

                <View
                    style={[
                        styles.diThinkingWrap,
                        {
                            right: width * 0.08,
                            top: height * 0.58,
                        },
                    ]}
                    pointerEvents="none"
                >
                    <SVGImage
                        Image={getSprite("di_thinking")}
                        width={width * 0.70}
                        height={height * 0.70}
                        style={styles.diThinking}
                    />
                </View>
            </ImageBackground>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(6, 12, 14, 0.72)",
        justifyContent: "center",
        alignItems: "center",
        // paddingTop: 254 * SCALE,
        // paddingBottom: 750 * SCALE,
    },


    header: {
        height: 72 * SCALE,
        paddingHorizontal: 22 * SCALE,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#294448",
        borderBottomWidth: 2 * SCALE,
        borderBottomColor: "rgba(214,214,182,0.35)",
    },

    headerTitle: {
        color: "#F1E8C8",
        fontSize: 28 * SCALE,
        fontFamily: "IBMPlexMono-Bold",
    },


    tabs: {
        flexDirection: "row",
        // paddingHorizontal: 28 * SCALE,
        // paddingTop: 26 * SCALE,
        paddingBottom: 52 * SCALE,
        gap: '1.3%',
        textAlign: 'center',
    },

    tab: {
        textAlign: 'center',
        width: '100%',
        // paddingHorizontal: 16 * SCALE,
        paddingVertical: 25 * SCALE,
        borderRadius: 12 * SCALE,
        backgroundColor: "#243A3D",
        // borderWidth: 2,
        // borderColor: "#D6D6B6",
    },

    activeTab: {
        backgroundColor: "#E9D7A6",
    },

    tabText: {
        color: "#F1E8C8",
        fontSize: 35 * SCALE,
        textAlign: 'center',
        textTransform: 'uppercase',
        fontFamily: "IBMPlexMono-Regular",
    },

    activeTabText: {
        color: "#1C2424",
        fontFamily: "IBMPlexMono-Bold",
    },

    desktopBody: {
        flex: 1,
        flexDirection: "row",
        padding: 18 * SCALE,
        gap: 18 * SCALE,
    },

    listPane: {
        width: "40%",
        backgroundColor: "#274245",
        borderRadius: 14 * SCALE,
        borderWidth: 2 * SCALE,
        borderColor: "#D6D6B6",
    },

    detailPane: {
        flex: 1,
        backgroundColor: "#274245",
        borderRadius: 14 * SCALE,
        borderWidth: 2 * SCALE,
        borderColor: "#D6D6B6",
        overflow: "hidden",
    },

    mobileBody: {
        flex: 1,
        // paddingHorizontal: 18 * SCALE,
        paddingBottom: 18 * SCALE,
    },

    mobileList: {
        flex: 1,
        // backgroundColor: "#274245",
        // borderRadius: 14 * SCALE,
        // borderWidth: 2 * SCALE,
        // borderColor: "#D6D6B6",
    },

    listContent: {
        paddingTop: 16 * SCALE,
        paddingBottom: 40 * SCALE,
    },

    emptyText: {
        textAlign: "center",
        color: "#F1E8C8",
        fontSize: 42 * SCALE,
        marginTop: 20 * SCALE,
        fontFamily: "IBMPlexMono-Regular",
    },

    placeholder: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24 * SCALE,
    },

    placeholderText: {
        color: "rgba(241,232,200,0.72)",
        fontSize: 24 * SCALE,
        textAlign: "center",
        // fontFamily: "IBMPlexMono-Regular",
    },

    icon: {
        position: "absolute",
        height: 110 * SCALE,
        width: 79 * SCALE,
        top: 0,
        left: -90 * SCALE
    },

    dossierPortraitWrap: {
        position: 'absolute',
        right: 0,
        top: 0,
        // width: 270 * SCALE,
        // height: 350 * SCALE,
        overflow: "hidden",   // 🔥 важно
        alignItems: "center",
        justifyContent: "center",
        // paddingTop: 30 * SCALE,
        // paddingLeft: 30 * SCALE,
        // marginLeft: 30 * SCALE
    },

    dossierPortrait: {
        transform: [
            { scale: 0.9 * SCALE },
            { translateX: 0},
            { translateY: 950*SCALE}
        ],
    },


    inventoryFrame: {
        marginBottom: 130,
        borderRadius: 18 * SCALE,
        padding: 6 * SCALE,
        width: "100%",
        height: 0.6 * height,
        overflow: "visible",
        zIndex: 10,
        elevation: 10,
    },

    tabBorder: {
        borderRadius: 12 * SCALE,
        padding: 6 * SCALE,
        width: "24%",
    },

    panel: {
        width: "100%",
        height: "100%",
        padding: 40 * SCALE,
        backgroundColor: "#385253",
        borderRadius: 18 * SCALE,
        overflow: "visible",
    },

    closeBtn: {
        position: "absolute",
        marginTop: 215 * SCALE,
        zIndex: 200,
        elevation: 200,
        paddingVertical: 28 * SCALE,
        paddingHorizontal: 46 * SCALE,
        borderRadius: 18 * SCALE,
        backgroundColor: "#494949",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 3 * SCALE,
        borderColor: "#FFFFFF",
    },

    closeBtnText: {
        color: "#FFFFFF",
        fontSize: 42 * SCALE,
    },

    backArrow: {
        position: "absolute",
        height: 110 * SCALE,
        width: 79 * SCALE,
        top: 0,
        left: -90 * SCALE,
        resizeMode: "contain",
    },
    diThinkingWrap: {
        position: "absolute",
        zIndex: 120,
        elevation: 120,
        width: 260 * SCALE,
        height: 420 * SCALE,
        justifyContent: "center",
        alignItems: "center",
        overflow: "visible",
    },

    diThinking: {
        transform: [{ translateY: 290 }, { translateX: -200 * SCALE }],
    },

    tabDescriptionGradient: {
        alignSelf: "flex-start",

        padding: 5 * SCALE,

        borderRadius: 18 * SCALE,

        marginBottom: 28 * SCALE,

        maxWidth: "88%",
    },

    tabDescription: {
        backgroundColor: "#385253",

        paddingHorizontal: 18 * SCALE,
        paddingVertical: 14 * SCALE,

        borderRadius: 13 * SCALE,
    },

    tabDescriptionText: {
        color: "#E9D7A6",

        fontFamily: "IBMPlexMono-Regular",

        fontSize: 34 * SCALE,
        lineHeight: 42 * SCALE,
    },
});
