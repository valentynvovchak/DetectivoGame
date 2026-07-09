import React, { useMemo, useState } from "react";
import {
    Modal,
    View,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
} from "react-native";

import { useGameStore } from "@/store/gameStore";
import AppText from "@/components/Common/AppText";
import { RESOURCES } from "@/assets/resources";

import factsData from "@/data/facts.json";
import dossierData from "@/data/dossier.json";
import evidenceData from "@/data/evidence.json";
import hypothesesData from "@/data/hypotheses.json";
import {SCALE} from "@/tools/constants";

type Category = "facts" | "dossier" | "evidence" | "hypotheses";

type ProofCorrectItem = {
    category: Category;
    id: string;
};

type ShowProofConfig = {
    title?: {
        ru?: string;
        en?: string;
    };
    categories?: Category[];
    correct: ProofCorrectItem[];
    wrongText?: {
        ru?: string;
        en?: string;
    };
};

type Props = {
    visible: boolean;
    proof: ShowProofConfig;
    onClose: () => void;
    onResult: (result: {
        correct: boolean;
        item: any;
    }) => void;
};

const CATEGORY_LABELS = {
    facts: "FACTS",
    dossier: "DOSSIER",
    evidence: "EVIDENCE",
    hypotheses: "HYPOTHESES",
};

const SOURCES: Record<string, any> = {
    facts: factsData,
    dossier: dossierData,
    evidence: evidenceData,
    hypotheses: hypothesesData,
};

export default function ShowProofModal({
           visible,
           proof,
           onClose,
           onResult,
       }: Props) {
    const { data, lang } = useGameStore();

    const allowedCategories = proof.categories || [
        "facts",
        "dossier",
        "evidence",
        "hypotheses",
    ];

    const [activeTab, setActiveTab] = useState<Category>(
        allowedCategories[0] || "evidence"
    );

    const [wrongMessage, setWrongMessage] = useState<string | null>(null);

    const items = useMemo(() => {
        const ids = (data as any)?.[activeTab] || [];
        const source = SOURCES[activeTab];

        if (!Array.isArray(ids)) return [];

        return ids
            .map((id: string) => {
                const raw = source?.[id];

                if (!raw) {
                    console.warn(`Missing ${activeTab} item:`, id);
                    return null;
                }

                const localized = raw?.[lang] || raw?.en || raw?.ru || raw;

                return {
                    id,
                    category: activeTab,
                    ...localized,
                };
            })
            .filter(Boolean);
    }, [data, activeTab, lang]);

    const isCorrectItem = (category: Category, id: string) => {
        return proof.correct?.some(
            (item) => item.category === category && item.id === id
        );
    };

    const handleSelect = (item: any) => {
        const correct = proof.correct?.some(
            (correctItem) =>
                correctItem.category === item.category &&
                correctItem.id === item.id
        );

        onResult({
            correct: !!correct,
            item,
        });
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.panel}>
                    <View style={styles.tabs}>
                        {allowedCategories.map((category) => (
                            <TouchableOpacity
                                key={category}
                                activeOpacity={0.85}
                                onPress={() => {
                                    setActiveTab(category);
                                    setWrongMessage(null);
                                }}
                                style={[
                                    styles.tab,
                                    activeTab === category && styles.tabActive,
                                ]}
                            >
                                <AppText
                                    style={[
                                        styles.tabText,
                                        activeTab === category &&
                                        styles.tabTextActive,
                                    ]}
                                >
                                    {CATEGORY_LABELS[category]}
                                </AppText>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.headerRow}>
                        <TouchableOpacity
                            style={styles.backButton}
                            activeOpacity={0.85}
                            onPress={onClose}
                        >
                            <AppText style={styles.backText}>
                                {lang === "ru" ? "назад" : "back"}
                            </AppText>
                        </TouchableOpacity>

                        <AppText style={styles.title}>
                            {proof.title?.[lang] ||
                                proof.title?.en ||
                                (lang === "ru"
                                    ? "Выберите доказательство"
                                    : "Select proof")}
                        </AppText>
                    </View>

                    {!!wrongMessage && (
                        <View style={styles.wrongBox}>
                            <AppText style={styles.wrongText}>
                                {wrongMessage}
                            </AppText>
                        </View>
                    )}

                    <ScrollView
                        style={styles.list}
                        contentContainerStyle={styles.listContent}
                    >
                        {items.length === 0 && (
                            <AppText style={styles.emptyText}>
                                {lang === "ru"
                                    ? "Нет доступных предметов."
                                    : "No available items."}
                            </AppText>
                        )}

                        {items.map((item: any) => (
                            <TouchableOpacity
                                key={`${item.category}_${item.id}`}
                                activeOpacity={0.85}
                                style={styles.card}
                                onPress={() => handleSelect(item)}
                            >
                                {!!item.icon && !!(RESOURCES as any)[item.icon] && (
                                    <Image
                                        source={(RESOURCES as any)[item.icon]}
                                        style={styles.icon}
                                    />
                                )}

                                <View style={styles.cardTextWrap}>
                                    <AppText style={styles.cardTitle}>
                                        {item.name}
                                    </AppText>

                                    <AppText style={styles.cardDescription}>
                                        {item.short_description ||
                                            item.description}
                                    </AppText>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.45)",
        justifyContent: "center",
        alignItems: "center",
    },

    panel: {
        width: "92%",
        height: "82%",
        backgroundColor: "rgba(42, 77, 74, 0.97)",
        borderWidth: 2,
        borderColor: "#E9DEC1",
        borderRadius: 8,
        padding: 10,
    },

    tabs: {
        flexDirection: "row",
        gap: 6,
        marginBottom: 12,
    },

    tab: {
        borderWidth: 2,
        borderColor: "#E9DEC1",
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 6,
        backgroundColor: "rgba(21, 34, 34, 0.9)",
    },

    tabActive: {
        backgroundColor: "#F1DFA7",
    },

    tabText: {
        color: "#F1DFA7",
        fontSize: 14 * 3 * SCALE,
        fontFamily: "IBMPlexMono-Regular",
    },

    tabTextActive: {
        color: "#314D4B",
    },

    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
        gap: 10,
    },

    backButton: {
        borderWidth: 1.5,
        borderColor: "#E9DEC1",
        borderRadius: 4,
        paddingHorizontal: 14,
        paddingVertical: 8,
        backgroundColor: "rgba(21, 34, 34, 0.8)",
    },

    backText: {
        color: "#fff",
        fontSize: 14 * 3 * SCALE,
        fontFamily: "IBMPlexMono-Regular",
    },

    title: {
        flex: 1,
        color: "#F1DFA7",
        fontSize: 13 * 3 * SCALE,
        lineHeight: 17 * 3 * SCALE,
        fontFamily: "IBMPlexMono-Regular",
    },

    wrongBox: {
        borderWidth: 1,
        borderColor: "#EA0F12",
        backgroundColor: "rgba(80, 20, 20, 0.8)",
        borderRadius: 5,
        padding: 8,
        marginBottom: 10,
    },

    wrongText: {
        color: "#fff",
        fontSize: 12 * 3 * SCALE,
        lineHeight: 16 * 3 * SCALE,
        fontFamily: "IBMPlexMono-Regular",
    },

    list: {
        flex: 1,
    },

    listContent: {
        paddingBottom: 20,
    },

    emptyText: {
        color: "#fff",
        opacity: 0.8,
        fontSize: 14 * 3 * SCALE,
        marginTop: 20,
        textAlign: "center",
    },

    card: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#E9DEC1",
        backgroundColor: "rgba(21, 34, 34, 0.88)",
        borderRadius: 7,
        padding: 8,
        marginBottom: 10,
        minHeight: 78,
    },

    icon: {
        width: 75 * 3 * SCALE,
        height: 75 * 3 * SCALE,
        borderRadius: 5,
        resizeMode: "cover",
        marginRight: 10,
    },

    cardTextWrap: {
        flex: 1,
    },

    cardTitle: {
        color: "#F1DFA7",
        fontSize: 11 * 3 * SCALE,
        lineHeight: 17 * 3 * SCALE,
        marginBottom: 3,
        fontFamily: "IBMPlexMono-Regular",
    },

    cardDescription: {
        color: "#fff",
        fontSize: 10 * 3 * SCALE,
        lineHeight: 14 * 3 * SCALE,
        fontFamily: "IBMPlexMono-Regular",
    },
});