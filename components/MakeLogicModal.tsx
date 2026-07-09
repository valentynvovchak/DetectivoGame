import React, { useEffect, useMemo, useState } from "react";
import {
    Modal,
    View,
    StyleSheet,
    TouchableOpacity,
    Image,
} from "react-native";

import { useGameStore } from "@/store/gameStore";
import AppText from "@/components/Common/AppText";
import { RESOURCES } from "@/assets/resources";

import factsData from "@/data/facts.json";
import dossierData from "@/data/dossier.json";
import evidenceData from "@/data/evidence.json";
import hypothesesData from "@/data/hypotheses.json";

type Category = "facts" | "dossier" | "evidence" | "hypotheses";

type LogicItemRef = {
    category: Category;
    id: string;
};

type LocalizedLogicItem = LogicItemRef & {
    name?: string;
    short_description?: string;
    description?: string;
    icon?: string;
    [key: string]: any;
};

type MakeLogicConfig = {
    title?: {
        ru?: string;
        en?: string;
    };

    description?: {
        ru?: string;
        en?: string;
    };

    buttonText?: {
        ru?: string;
        en?: string;
    };

    items?: LogicItemRef[];

    categories?: Category[];

    correctPairs: LogicItemRef[][];

    successLine?: number;
    wrongLine?: number;
};

type Props = {
    visible: boolean;
    logic: MakeLogicConfig;
    onClose: () => void;

    onResult: (result: {
        correct: boolean;
        items: LocalizedLogicItem[];
    }) => void;
};

const SOURCES: Record<Category, any> = {
    facts: factsData,
    dossier: dossierData,
    evidence: evidenceData,
    hypotheses: hypothesesData,
};

/**
 * Уникальный ключ одного предмета:
 * evidence:laboratory_conclusion
 */
const getItemKey = (item: LogicItemRef): string => {
    return `${item.category}:${item.id}`;
};

/**
 * Уникальный ключ пары.
 *
 * Благодаря sort порядок выбора не имеет значения:
 *
 * A + B
 * B + A
 *
 * дадут одинаковый ключ.
 */
const getPairKey = (pair: LogicItemRef[]): string => {
    return pair
        .map(getItemKey)
        .sort()
        .join("|");
};

export default function MakeLogicModal({
                                           visible,
                                           logic,
                                           onClose,
                                           onResult,
                                       }: Props) {
    const { data, lang } = useGameStore();

    const [selectedItems, setSelectedItems] = useState<LocalizedLogicItem[]>([]);

    /**
     * Каждый раз при открытии модалки
     * очищаем предыдущий выбор.
     */
    useEffect(() => {
        if (visible) {
            setSelectedItems([]);
        }
    }, [visible]);

    /**
     * Получает полный локализованный объект
     * по category + id.
     */
    const getLocalizedItem = (
        ref: LogicItemRef
    ): LocalizedLogicItem | null => {
        const source = SOURCES[ref.category];
        const raw = source?.[ref.id];

        if (!raw) {
            console.warn("❌ Missing logic item:", ref);
            return null;
        }

        const localized =
            raw?.[lang] ||
            raw?.en ||
            raw?.ru ||
            raw;

        return {
            category: ref.category,
            id: ref.id,
            ...localized,
        };
    };

    /**
     * Собираем все разрешённые карточки.
     *
     * Если в JSON есть logic.items —
     * показываем именно их.
     *
     * Иначе берём все предметы игрока
     * из указанных categories.
     */
    const items = useMemo<LocalizedLogicItem[]>(() => {
        if (logic.items?.length) {
            return logic.items
                .map(getLocalizedItem)
                .filter(
                    (item): item is LocalizedLogicItem =>
                        item !== null
                );
        }

        const categories: Category[] =
            logic.categories || ["facts", "evidence"];

        return categories.flatMap((category) => {
            const ids = (data as any)?.[category] || [];

            if (!Array.isArray(ids)) {
                return [];
            }

            return ids
                .map((id: string) =>
                    getLocalizedItem({
                        category,
                        id,
                    })
                )
                .filter(
                    (item): item is LocalizedLogicItem =>
                        item !== null
                );
        });
    }, [logic.items, logic.categories, data, lang]);

    /**
     * Набор всех правильных пар.
     *
     * ВАЖНО:
     * здесь проверяются ВСЕ пары из correctPairs,
     * а не только первая.
     */
    const correctPairKeys = useMemo(() => {
        const keys = (logic.correctPairs || []).map((pair) =>
            getPairKey(pair)
        );

        console.log("🧠 ALL CORRECT LOGIC PAIRS:", keys);

        return new Set(keys);
    }, [logic.correctPairs]);

    /**
     * Проверяет, выбран ли предмет.
     */
    const isItemSelected = (item: LogicItemRef): boolean => {
        const itemKey = getItemKey(item);

        return selectedItems.some(
            (selectedItem) =>
                getItemKey(selectedItem) === itemKey
        );
    };

    /**
     * Выбор/отмена выбора карточки.
     *
     * Максимум можно выбрать 2 карточки.
     * Если уже выбраны 2 и нажать третью —
     * первая удаляется, вторая остаётся,
     * третья становится новой второй.
     */
    const toggleItem = (item: LocalizedLogicItem) => {
        const itemKey = getItemKey(item);

        const alreadySelected = selectedItems.some(
            (selectedItem) =>
                getItemKey(selectedItem) === itemKey
        );

        if (alreadySelected) {
            setSelectedItems((prev) =>
                prev.filter(
                    (selectedItem) =>
                        getItemKey(selectedItem) !== itemKey
                )
            );

            return;
        }

        if (selectedItems.length >= 2) {
            setSelectedItems([
                selectedItems[1],
                item,
            ]);

            return;
        }

        setSelectedItems((prev) => [
            ...prev,
            item,
        ]);
    };

    /**
     * Проверка выбранной пары.
     */
    const handleConnect = () => {
        if (selectedItems.length !== 2) {
            return;
        }

        const selectedPairKey = getPairKey(selectedItems);

        const correct =
            correctPairKeys.has(selectedPairKey);

        console.log("🧠 MAKE LOGIC CHECK:", {
            selectedPairKey,
            correctPairs: Array.from(correctPairKeys),
            correct,
            selectedItems: selectedItems.map((item) => ({
                category: item.category,
                id: item.id,
            })),
        });

        onResult({
            correct,
            items: selectedItems,
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
                    <AppText style={styles.logoText}>
                        make 🧠 logic
                    </AppText>

                    <AppText style={styles.description}>
                        {logic.description?.[lang] ||
                            logic.description?.en ||
                            ""}
                    </AppText>

                    {/* Карточки 2 колонки */}
                    <View style={styles.itemsGrid}>
                        {items.map((item, index) => {
                            const selected =
                                isItemSelected(item);

                            const isLastOddItem =
                                items.length % 2 !== 0 &&
                                index === items.length - 1;

                            return (
                                <TouchableOpacity
                                    key={getItemKey(item)}
                                    activeOpacity={0.85}
                                    onPress={() =>
                                        toggleItem(item)
                                    }
                                    style={[
                                        styles.card,

                                        selected &&
                                        styles.cardSelected,

                                        isLastOddItem &&
                                        styles.lastOddCard,
                                    ]}
                                >
                                    {!!item.icon &&
                                        !!(RESOURCES as any)[
                                            item.icon
                                            ] && (
                                            <Image
                                                source={
                                                    (RESOURCES as any)[
                                                        item.icon
                                                        ]
                                                }
                                                style={
                                                    styles.cardIcon
                                                }
                                            />
                                        )}

                                    <AppText
                                        style={styles.cardText}
                                        numberOfLines={4}
                                    >
                                        {item.short_description ||
                                            item.name ||
                                            item.description ||
                                            ""}
                                    </AppText>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Connect */}
                    <TouchableOpacity
                        activeOpacity={0.85}
                        disabled={
                            selectedItems.length !== 2
                        }
                        style={[
                            styles.connectButton,

                            selectedItems.length !== 2 &&
                            styles.connectButtonDisabled,
                        ]}
                        onPress={handleConnect}
                    >
                        <AppText style={styles.connectText}>
                            Connect
                        </AppText>
                    </TouchableOpacity>

                    {/* Стрелка */}
                    <View style={styles.arrow} />

                    {/* Выбранные предметы */}
                    <View style={styles.slots}>
                        <View style={styles.slot}>
                            <AppText
                                style={styles.slotText}
                                numberOfLines={4}
                            >
                                {selectedItems[0]
                                        ?.short_description ||
                                    selectedItems[0]?.name ||
                                    ""}
                            </AppText>
                        </View>

                        <View style={styles.slot}>
                            <AppText
                                style={styles.slotText}
                                numberOfLines={4}
                            >
                                {selectedItems[1]
                                        ?.short_description ||
                                    selectedItems[1]?.name ||
                                    ""}
                            </AppText>
                        </View>
                    </View>

                    {/* Back */}
                    <TouchableOpacity
                        activeOpacity={0.85}
                        style={styles.backButton}
                        onPress={onClose}
                    >
                        <AppText style={styles.backText}>
                            {lang === "ru"
                                ? "назад"
                                : "back"}
                        </AppText>
                    </TouchableOpacity>
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
        width: "88%",
        maxWidth: 430,

        backgroundColor: "rgba(48, 82, 78, 0.98)",

        borderWidth: 2,
        borderColor: "#E9DEC1",

        borderRadius: 8,

        paddingHorizontal: 14,
        paddingTop: 18,
        paddingBottom: 14,

        alignItems: "center",

        overflow: "visible",
    },

    logoText: {
        color: "#F4EAD0",

        fontSize: 22,
        lineHeight: 28,

        fontFamily: "IBMPlexMono-Regular",
        fontWeight: "700",

        marginBottom: 10,
    },

    description: {
        width: "92%",

        color: "#FFFFFF",

        fontSize: 11,
        lineHeight: 15,

        textAlign: "center",

        opacity: 0.9,

        marginBottom: 12,

        fontFamily: "IBMPlexMono-Regular",
    },

    /**
     * Сетка карточек.
     *
     * justifyContent:center обеспечивает:
     * если карточек нечётное количество,
     * последняя оказывается по центру.
     */
    itemsGrid: {
        width: "100%",

        flexDirection: "row",
        flexWrap: "wrap",

        justifyContent: "center",

        columnGap: 10,
        rowGap: 10,

        marginTop: 4,
        marginBottom: 14,
    },

    card: {
        width: "47%",
        minHeight: 76,

        flexDirection: "row",
        alignItems: "center",

        backgroundColor: "#F1DFA7",

        borderWidth: 2,
        borderColor: "#D7C78E",

        borderRadius: 6,

        padding: 5,
    },

    /**
     * Явно оставляем ширину 47%,
     * тогда нечётная последняя карточка
     * становится по центру благодаря
     * justifyContent:center у itemsGrid.
     */
    lastOddCard: {
        width: "47%",
    },

    cardSelected: {
        borderColor: "#28BCE8",
        borderWidth: 3,

        backgroundColor: "#F5E4AE",
    },

    cardIcon: {
        width: 52,
        height: 52,

        borderRadius: 5,

        resizeMode: "cover",

        marginRight: 6,

        borderWidth: 1,
        borderColor: "#4B736F",
    },

    cardText: {
        flex: 1,

        color: "#314D4B",

        fontSize: 9,
        lineHeight: 12,

        fontFamily: "IBMPlexMono-Regular",
    },

    connectButton: {
        marginTop: 8,

        minWidth: 120,

        paddingHorizontal: 18,
        paddingVertical: 8,

        borderWidth: 1.5,
        borderColor: "#E9DEC1",

        borderRadius: 5,

        backgroundColor: "rgba(36, 78, 62, 0.96)",

        alignItems: "center",
        justifyContent: "center",
    },

    connectButtonDisabled: {
        opacity: 0.45,
    },

    connectText: {
        color: "#FFFFFF",

        fontSize: 13,

        fontFamily: "IBMPlexMono-Regular",
    },

    arrow: {
        marginTop: 10,

        width: 0,
        height: 0,

        borderLeftWidth: 14,
        borderRightWidth: 14,
        borderTopWidth: 16,

        borderLeftColor: "transparent",
        borderRightColor: "transparent",
        borderTopColor: "#2BB5E8",
    },

    slots: {
        width: "100%",

        flexDirection: "row",

        gap: 12,

        marginTop: 14,
    },

    slot: {
        flex: 1,

        minHeight: 54,

        backgroundColor: "#F1DFA7",

        borderRadius: 5,

        borderWidth: 1.5,
        borderColor: "#E9DEC1",

        justifyContent: "center",
        alignItems: "center",

        paddingHorizontal: 6,
        paddingVertical: 6,
    },

    slotText: {
        color: "#314D4B",

        fontSize: 9,
        lineHeight: 12,

        textAlign: "center",

        fontFamily: "IBMPlexMono-Regular",
    },

    backButton: {
        position: "absolute",

        left: 12,
        bottom: -52,

        backgroundColor: "rgba(30, 50, 50, 0.96)",

        borderWidth: 1.5,
        borderColor: "#E9DEC1",

        borderRadius: 5,

        paddingHorizontal: 14,
        paddingVertical: 8,

        zIndex: 20,
        elevation: 20,
    },

    backText: {
        color: "#FFFFFF",

        fontSize: 13,

        fontFamily: "IBMPlexMono-Regular",
    },
});