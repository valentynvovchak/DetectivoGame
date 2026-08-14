import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    ImageBackground,
    Modal,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppText from "@/components/Common/AppText";
import MixedIcon from "@/components/Common/MixedIcon";
import InventoryRow from "@/components/Inventory/InventoryRow";
import SVGImage from "@/components/small/SVGImage";

import { useGameStore } from "@/store/gameStore";
import { SCALE } from "@/tools/constants";
import {
    getBackground,
    getSprite,
} from "@/tools/utils";

import factsJson from "@/data/facts.json";
import dossierJson from "@/data/dossier.json";
import evidenceJson from "@/data/evidence.json";
import hypothesesJson from "@/data/hypotheses.json";

type Lang = "ru" | "en";

type InventoryCategory =
    | "facts"
    | "dossier"
    | "evidence"
    | "hypotheses";

type SingleSection =
    | "suspect"
    | "motive"
    | "method";

type PickerState =
    | {
    section: SingleSection;
}
    | {
    section: "keyEvidence";
    evidenceIndex: number;
}
    | null;

type CourtItem = {
    id: string;
    category: InventoryCategory;

    title: string;
    description?: string;

    icon?: string;
    sprite?: string;
    bg?: string;
};

type ExpectedItem = {
    id: string;
    category: InventoryCategory;
};

export type CourtAnswer = {
    suspect: CourtItem | null;
    motive: CourtItem | null;
    method: CourtItem | null;
    keyEvidence: CourtItem[];
};

type CourtCaseBuilderModalProps = {
    visible: boolean;
    onClose: () => void;

    onSubmit: (result: {
        correct: boolean;
        answer: CourtAnswer;
    }) => void | Promise<void>;
};

const factsData =
    factsJson as Record<string, any>;

const dossierData =
    dossierJson as Record<string, any>;

const evidenceData =
    evidenceJson as Record<string, any>;

const hypothesesData =
    hypothesesJson as Record<string, any>;

const DATA_SOURCES: Record<
    InventoryCategory,
    Record<string, any>
    > = {
    facts: factsData,
    dossier: dossierData,
    evidence: evidenceData,
    hypotheses: hypothesesData,
};

/*
 * Какие категории можно выбирать
 * в каждом разделе суда.
 */
const ALLOWED_CATEGORIES: Record<
    SingleSection | "keyEvidence",
    InventoryCategory[]
    > = {
    suspect: ["dossier"],

    motive: ["hypotheses"],

    method: [
        "evidence",
        "hypotheses",
    ],

    keyEvidence: [
        "facts",
        "evidence",
    ],
};

/*
 * Правильное решение дела.
 *
 * Если реальные ID у тебя называются иначе,
 * исправлять нужно только этот объект.
 */
const CORRECT_ANSWER: {
    suspect: ExpectedItem;
    motive: ExpectedItem;
    method: ExpectedItem;
    keyEvidence: ExpectedItem[];
} = {
    suspect: {
        category: "dossier",
        id: "mr_kanagawa",
    },

    motive: {
        category: "hypotheses",
        id: "mr_kanagawa_possible_motive",
    },

    method: {
        category: "evidence",
        id: "carbon_monoxide_in_yoga_ball",
    },

    keyEvidence: [
        {
            category: "evidence",
            id: "yoga_ball_plug",
        },
        {
            category: "facts",
            id: "missing_carbon_monoxide_cylinder",
        },
    ],
};

const EMPTY_EVIDENCE_SLOTS:
    Array<CourtItem | null> = [
    null,
    null,
    null,
    null,
];

function clamp(
    value: number,
    min: number,
    max: number
) {
    return Math.min(
        Math.max(value, min),
        max
    );
}

function getCourtItem(
    category: InventoryCategory,
    id: string,
    lang: Lang
): CourtItem | null {
    const source = DATA_SOURCES[category];
    const rawItem = source?.[id];

    if (!rawItem) {
        console.warn(
            `Court item not found: ${category}:${id}`
        );

        return null;
    }

    /*
     * Поддерживаются оба формата:
     *
     * {
     *   ru: {...},
     *   en: {...}
     * }
     *
     * и уже локализованный объект.
     */
    const translatedItem =
        rawItem?.[lang] ?? rawItem;

    const appearance =
        translatedItem?.appearance ??
        rawItem?.appearance ??
        null;

    return {
        id,
        category,

        title:
            translatedItem?.short_description ??
            translatedItem?.name ??
            translatedItem?.title ??
            id,

        description:
            translatedItem?.description ??
            "",

        icon:
            translatedItem?.icon ??
            rawItem?.icon,

        sprite:
        appearance?.sprite,

        bg:
        appearance?.bg,
    };
}

function itemMatches(
    selectedItem: CourtItem | null,
    expectedItem: ExpectedItem
) {
    return (
        selectedItem?.id ===
        expectedItem.id &&
        selectedItem?.category ===
        expectedItem.category
    );
}

function evidenceMatches(
    selectedItems: CourtItem[],
    expectedItems: ExpectedItem[]
) {
    /*
     * Сейчас для правильного решения
     * необходимо выбрать ровно две
     * ключевые улики.
     *
     * Если игрок добавит лишнюю улику,
     * ответ будет считаться неправильным.
     */
    if (
        selectedItems.length !==
        expectedItems.length
    ) {
        return false;
    }

    return expectedItems.every(
        (expectedItem) =>
            selectedItems.some(
                (selectedItem) =>
                    selectedItem.id ===
                    expectedItem.id &&
                    selectedItem.category ===
                    expectedItem.category
            )
    );
}

function sameCourtItem(
    first: CourtItem | null,
    second: CourtItem | null
) {
    return (
        first?.id === second?.id &&
        first?.category === second?.category
    );
}

export default function CourtCaseBuilderModal({
                                                  visible,
                                                  onClose,
                                                  onSubmit,
                                              }: CourtCaseBuilderModalProps) {
    const {
        width,
        height,
    } = useWindowDimensions();

    const insets = useSafeAreaInsets();

    const {
        data,
        lang,
    } = useGameStore();

    const currentLang =
        lang as Lang;

    const [picker, setPicker] =
        useState<PickerState>(null);

    const [suspect, setSuspect] =
        useState<CourtItem | null>(null);

    const [motive, setMotive] =
        useState<CourtItem | null>(null);

    const [method, setMethod] =
        useState<CourtItem | null>(null);

    const [
        evidenceSlots,
        setEvidenceSlots,
    ] = useState<
        Array<CourtItem | null>
        >([...EMPTY_EVIDENCE_SLOTS]);

    const usableHeight =
        height -
        insets.top -
        insets.bottom;

    const panelWidth = clamp(
        width * 0.94,
        310,
        620
    );

    const panelHeight = clamp(
        usableHeight * 0.66,
        540,
        760
    );

    const pickerWidth = clamp(
        width * 0.92,
        300,
        610
    );

    const pickerHeight = clamp(
        usableHeight * 0.75,
        500,
        860
    );

    useEffect(() => {
        if (!visible) {
            setPicker(null);
        }
    }, [visible]);

    const availableItems =
        useMemo(() => {
            if (!picker) {
                return [];
            }

            const allowedCategories =
                ALLOWED_CATEGORIES[
                    picker.section
                    ];

            const result: CourtItem[] = [];

            allowedCategories.forEach(
                (category) => {
                    const collectedIds =
                        (data?.[
                            category
                            ] ?? []) as string[];

                    collectedIds.forEach(
                        (id) => {
                            const item =
                                getCourtItem(
                                    category,
                                    id,
                                    currentLang
                                );

                            if (item) {
                                result.push(item);
                            }
                        }
                    );
                }
            );

            return result;
        }, [
            picker,
            data,
            currentLang,
        ]);

    const selectedEvidence =
        evidenceSlots.filter(
            (
                item
            ): item is CourtItem =>
                item !== null
        );

    const enoughItemsSelected =
        suspect !== null &&
        motive !== null &&
        method !== null &&
        selectedEvidence.length >=
        CORRECT_ANSWER.keyEvidence
            .length;

    const pickerTitle = useMemo(() => {
        if (!picker) {
            return "";
        }

        switch (picker.section) {
            case "suspect":
                return currentLang === "ru"
                    ? "Выберите подозреваемого"
                    : "Select a suspect";

            case "motive":
                return currentLang === "ru"
                    ? "Выберите мотив"
                    : "Select a motive";

            case "method":
                return currentLang === "ru"
                    ? "Выберите способ убийства"
                    : "Select the method of murder";

            case "keyEvidence":
                return currentLang === "ru"
                    ? "Выберите ключевую улику"
                    : "Select key evidence";

            default:
                return "";
        }
    }, [
        picker,
        currentLang,
    ]);

    const isSelected = (
        item: CourtItem
    ) => {
        if (
            sameCourtItem(
                suspect,
                item
            )
        ) {
            return true;
        }

        if (
            sameCourtItem(
                motive,
                item
            )
        ) {
            return true;
        }

        if (
            sameCourtItem(
                method,
                item
            )
        ) {
            return true;
        }

        return evidenceSlots.some(
            (selectedItem) =>
                sameCourtItem(
                    selectedItem,
                    item
                )
        );
    };

    const selectItem = (
        item: CourtItem
    ) => {
        if (!picker) {
            return;
        }

        switch (picker.section) {
            case "suspect":
                setSuspect(item);
                setPicker(null);
                return;

            case "motive":
                setMotive(item);
                setPicker(null);
                return;

            case "method":
                setMethod(item);
                setPicker(null);
                return;

            case "keyEvidence": {
                const targetIndex =
                    picker.evidenceIndex;

                setEvidenceSlots(
                    (currentSlots) => {
                        const nextSlots = [
                            ...currentSlots,
                        ];

                        /*
                         * Одна улика не может
                         * одновременно занимать
                         * два слота.
                         */
                        const duplicateIndex =
                            nextSlots.findIndex(
                                (
                                    selectedItem
                                ) =>
                                    sameCourtItem(
                                        selectedItem,
                                        item
                                    )
                            );

                        if (
                            duplicateIndex !== -1 &&
                            duplicateIndex !==
                            targetIndex
                        ) {
                            nextSlots[
                                duplicateIndex
                                ] = null;
                        }

                        nextSlots[
                            targetIndex
                            ] = item;

                        return nextSlots;
                    }
                );

                setPicker(null);
                return;
            }

            default:
                return;
        }
    };

    const removeEvidence = (
        index: number
    ) => {
        setEvidenceSlots(
            (currentSlots) => {
                const nextSlots = [
                    ...currentSlots,
                ];

                nextSlots[index] = null;

                return nextSlots;
            }
        );
    };

    const submitCase = async () => {
        if (!enoughItemsSelected) {
            return;
        }

        const answer: CourtAnswer = {
            suspect,
            motive,
            method,
            keyEvidence:
            selectedEvidence,
        };

        const correct =
            itemMatches(
                suspect,
                CORRECT_ANSWER.suspect
            ) &&
            itemMatches(
                motive,
                CORRECT_ANSWER.motive
            ) &&
            itemMatches(
                method,
                CORRECT_ANSWER.method
            ) &&
            evidenceMatches(
                selectedEvidence,
                CORRECT_ANSWER.keyEvidence
            );

        await onSubmit({
            correct,
            answer,
        });
    };

    return (
        <Modal
            visible={visible}
            transparent={false}
            animationType="fade"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <ImageBackground
                source={getBackground(
                    "inventory_bg"
                )}
                style={styles.screen}
                resizeMode="cover"
            >
                <LinearGradient
                    colors={[
                        "#CCCCCC",
                        "#CACA99",
                    ]}
                    start={{
                        x: 0,
                        y: 0,
                    }}
                    end={{
                        x: 0,
                        y: 1,
                    }}
                    style={[
                        styles.frame,
                        {
                            width:
                            panelWidth,
                            height:
                            panelHeight,
                            marginTop:
                                insets.top +
                                8,
                        },
                    ]}
                >
                    <View
                        style={styles.panel}
                    >
                        <ScrollView
                            style={
                                styles.formScroll
                            }
                            contentContainerStyle={
                                styles.formContent
                            }
                            showsVerticalScrollIndicator={
                                false
                            }
                            bounces={false}
                        >
                            <View
                                style={
                                    styles.introBox
                                }
                            >
                                <AppText
                                    style={
                                        styles.introText
                                    }
                                >
                                    {currentLang ===
                                    "ru"
                                        ? "Решающий момент!\nВыберите материалы, которые будут переданы в суд:"
                                        : "The decisive moment!\nSelect evidence to submit to the court:"}
                                </AppText>
                            </View>

                            <SingleSelectionRow
                                label={
                                    currentLang ===
                                    "ru"
                                        ? "Подозреваемый"
                                        : "Suspect"
                                }
                                item={suspect}
                                onPress={() =>
                                    setPicker({
                                        section:
                                            "suspect",
                                    })
                                }
                            />

                            <SingleSelectionRow
                                label={
                                    currentLang ===
                                    "ru"
                                        ? "Мотив"
                                        : "Motive"
                                }
                                item={motive}
                                onPress={() =>
                                    setPicker({
                                        section:
                                            "motive",
                                    })
                                }
                            />

                            <SingleSelectionRow
                                label={
                                    currentLang ===
                                    "ru"
                                        ? "Способ убийства"
                                        : "Method of murder"
                                }
                                item={method}
                                onPress={() =>
                                    setPicker({
                                        section:
                                            "method",
                                    })
                                }
                            />

                            <View
                                style={
                                    styles.evidenceSection
                                }
                            >
                                <AppText
                                    style={
                                        styles.sectionLabel
                                    }
                                >
                                    {currentLang ===
                                    "ru"
                                        ? "Ключевые доказательства против подозреваемого:"
                                        : "Key evidence against suspect:"}
                                </AppText>

                                <View
                                    style={
                                        styles.evidenceSlots
                                    }
                                >
                                    {evidenceSlots.map(
                                        (
                                            item,
                                            index
                                        ) => (
                                            <EvidenceSlot
                                                key={
                                                    index
                                                }
                                                item={
                                                    item
                                                }
                                                onPress={() =>
                                                    setPicker(
                                                        {
                                                            section:
                                                                "keyEvidence",
                                                            evidenceIndex:
                                                            index,
                                                        }
                                                    )
                                                }
                                                onRemove={() =>
                                                    removeEvidence(
                                                        index
                                                    )
                                                }
                                            />
                                        )
                                    )}
                                </View>
                            </View>
                        </ScrollView>

                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                !enoughItemsSelected &&
                                styles.submitButtonDisabled,
                            ]}
                            activeOpacity={0.85}
                            disabled={
                                !enoughItemsSelected
                            }
                            onPress={
                                submitCase
                            }
                        >
                            <AppText
                                style={
                                    styles.submitButtonText
                                }
                            >
                                {currentLang ===
                                "ru"
                                    ? "Передать дело в суд"
                                    : "Submit case to court"}
                            </AppText>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>

                <TouchableOpacity
                    style={[
                        styles.backButton,
                        {
                            left:
                                width *
                                0.08,

                            bottom:
                                Math.max(
                                    insets.bottom,
                                    10
                                ) + 18,
                        },
                    ]}
                    activeOpacity={0.85}
                    onPress={onClose}
                >
                    <AppText
                        style={
                            styles.backButtonText
                        }
                    >
                        {currentLang === "ru"
                            ? "назад"
                            : "back"}
                    </AppText>
                </TouchableOpacity>

                {/*
                 * Дэниел отображается точно
                 * по рабочей схеме di_thinking
                 * из InventoryModal.
                 */}
                <View
                    style={[
                        styles.danielThinkingWrap,
                        {
                            right:
                                width * 0.08,

                            top:
                                height * 0.58,
                        },
                    ]}
                    pointerEvents="none"
                >
                    <SVGImage
                        Image={getSprite(
                            "daniel_thinking"
                        )}
                        width={
                            width * 0.7
                        }
                        height={
                            height * 0.7
                        }
                        style={
                            styles.danielThinking
                        }
                    />
                </View>

                {picker && (
                    <View
                        style={[
                            styles.pickerOverlay,
                            {
                                paddingTop:
                                    insets.top +
                                    12,

                                paddingBottom:
                                    insets.bottom +
                                    12,
                            },
                        ]}
                    >
                        <LinearGradient
                            colors={[
                                "#CCCCCC",
                                "#CACA99",
                            ]}
                            start={{
                                x: 0,
                                y: 0,
                            }}
                            end={{
                                x: 0,
                                y: 1,
                            }}
                            style={[
                                styles.pickerFrame,
                                {
                                    width:
                                    pickerWidth,

                                    height:
                                    pickerHeight,
                                },
                            ]}
                        >
                            <View
                                style={
                                    styles.pickerPanel
                                }
                            >
                                <AppText
                                    style={
                                        styles.pickerTitle
                                    }
                                >
                                    {
                                        pickerTitle
                                    }
                                </AppText>

                                <View
                                    style={
                                        styles.pickerListWrap
                                    }
                                >
                                    <ScrollView
                                        style={
                                            styles.pickerList
                                        }
                                        contentContainerStyle={
                                            styles.pickerListContent
                                        }
                                        showsVerticalScrollIndicator
                                        nestedScrollEnabled
                                        bounces={false}
                                    >
                                        {availableItems.length ===
                                        0 ? (
                                            <AppText
                                                style={
                                                    styles.emptyText
                                                }
                                            >
                                                {currentLang ===
                                                "ru"
                                                    ? "Подходящих собранных материалов пока нет."
                                                    : "No suitable collected items yet."}
                                            </AppText>
                                        ) : (
                                            availableItems.map(
                                                (
                                                    item,
                                                    index
                                                ) => (
                                                    <InventoryRow
                                                        key={`${item.category}:${item.id}`}
                                                        index={
                                                            index
                                                        }
                                                        title={
                                                            item.title
                                                        }
                                                        icon={
                                                            item.icon
                                                        }
                                                        sprite={
                                                            item.sprite
                                                        }
                                                        bg={
                                                            item.bg
                                                        }
                                                        active={isSelected(
                                                            item
                                                        )}
                                                        onPress={() =>
                                                            selectItem(
                                                                item
                                                            )
                                                        }
                                                    />
                                                )
                                            )
                                        )}
                                    </ScrollView>
                                </View>

                                <TouchableOpacity
                                    style={
                                        styles.cancelPickerButton
                                    }
                                    activeOpacity={
                                        0.85
                                    }
                                    onPress={() =>
                                        setPicker(
                                            null
                                        )
                                    }
                                >
                                    <AppText
                                        style={
                                            styles.cancelPickerText
                                        }
                                    >
                                        {currentLang ===
                                        "ru"
                                            ? "Отмена"
                                            : "Cancel"}
                                    </AppText>
                                </TouchableOpacity>
                            </View>
                        </LinearGradient>
                    </View>
                )}
            </ImageBackground>
        </Modal>
    );
}

function SingleSelectionRow({
                                label,
                                item,
                                onPress,
                            }: {
    label: string;
    item: CourtItem | null;
    onPress: () => void;
}) {
    return (
        <TouchableOpacity
            style={styles.selectionRow}
            activeOpacity={0.85}
            onPress={onPress}
        >
            <View
                style={
                    styles.selectionTextWrap
                }
            >
                <AppText
                    style={
                        styles.selectionLabel
                    }
                >
                    {label}
                </AppText>

                {item && (
                    <AppText
                        style={
                            styles.selectionValue
                        }
                        numberOfLines={2}
                        ellipsizeMode="tail"
                    >
                        {item.title}
                    </AppText>
                )}
            </View>

            {item ? (
                <CourtItemIcon
                    item={item}
                    size={54}
                />
            ) : (
                <View
                    style={
                        styles.plusButton
                    }
                >
                    <AppText
                        style={
                            styles.plusText
                        }
                    >
                        +
                    </AppText>
                </View>
            )}
        </TouchableOpacity>
    );
}

function EvidenceSlot({
                          item,
                          onPress,
                          onRemove,
                      }: {
    item: CourtItem | null;
    onPress: () => void;
    onRemove: () => void;
}) {
    return (
        <View
            style={styles.evidenceSlot}
        >
            <TouchableOpacity
                style={
                    styles.evidenceSlotPressable
                }
                activeOpacity={0.85}
                onPress={onPress}
            >
                {item ? (
                    <CourtItemIcon
                        item={item}
                        size={54}
                    />
                ) : (
                    <AppText
                        style={
                            styles.slotPlus
                        }
                    >
                        +
                    </AppText>
                )}
            </TouchableOpacity>

            {item && (
                <TouchableOpacity
                    style={
                        styles.removeButton
                    }
                    activeOpacity={0.8}
                    onPress={onRemove}
                >
                    <AppText
                        style={
                            styles.removeButtonText
                        }
                    >
                        ×
                    </AppText>
                </TouchableOpacity>
            )}
        </View>
    );
}

function CourtItemIcon({
                           item,
                           size,
                       }: {
    item: CourtItem;
    size: number;
}) {
    if (item.icon) {
        return (
            <View
                style={[
                    styles.itemIconWrap,
                    {
                        width: size,
                        height: size,
                    },
                ]}
            >
                <MixedIcon
                    icon={item.icon}
                    width={size}
                    height={size}
                    resizeMode="cover"
                />
            </View>
        );
    }

    if (item.sprite) {
        const Sprite =
            getSprite(item.sprite);

        if (Sprite) {
            return (
                <View
                    style={[
                        styles.itemIconWrap,
                        {
                            width: size,
                            height: size,

                            backgroundColor:
                                item.bg ??
                                "#FFFFFF",
                        },
                    ]}
                >
                    <SVGImage
                        Image={Sprite}
                        width={
                            size * 1.6
                        }
                        height={
                            size * 3.4
                        }
                        style={
                            styles.itemSprite
                        }
                    />
                </View>
            );
        }
    }

    return (
        <View
            style={[
                styles.itemIconFallback,
                {
                    width: size,
                    height: size,
                },
            ]}
        >
            <AppText
                style={
                    styles.itemIconFallbackText
                }
            >
                ?
            </AppText>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,

        alignItems: "center",
        justifyContent: "flex-start",

        overflow: "visible",
    },

    frame: {
        padding: 2,

        borderRadius: 9,

        zIndex: 20,
        elevation: 20,

        overflow: "hidden",
    },

    panel: {
        flex: 1,
        minHeight: 0,

        width: "100%",

        paddingHorizontal: 14,
        paddingTop: 14,
        paddingBottom: 14,

        backgroundColor:
            "rgba(56, 82, 83, 0.98)",

        borderRadius: 7,

        overflow: "hidden",
    },

    formScroll: {
        flex: 1,
        minHeight: 0,
    },

    formContent: {
        paddingBottom: 8,
    },

    introBox: {
        paddingHorizontal: 10,
        paddingVertical: 8,

        marginBottom: 14,

        borderWidth: 1.5,
        borderColor: "#D2D0A7",
        borderRadius: 6,
    },

    introText: {
        color: "#F1E8C8",

        fontFamily:
            "IBMPlexMono-Regular",

        fontSize: 15,
        lineHeight: 21,
    },

    selectionRow: {
        minHeight: 78,

        flexDirection: "row",
        alignItems: "center",
        justifyContent:
            "space-between",

        paddingLeft: 12,
        paddingRight: 8,
        paddingVertical: 7,

        marginBottom: 11,

        backgroundColor: "#1B2A2D",

        borderWidth: 1.5,
        borderColor: "#D2D0A7",
        borderRadius: 7,
    },

    selectionTextWrap: {
        flex: 1,

        paddingRight: 10,
    },

    selectionLabel: {
        color: "#F1E8C8",

        fontFamily:
            "IBMPlexMono-Regular",

        fontSize: 16,
        lineHeight: 21,
    },

    selectionValue: {
        marginTop: 5,

        color: "#FFFFFF",

        fontFamily:
            "IBMPlexMono-Regular",

        fontSize: 13,
        lineHeight: 18,
    },

    plusButton: {
        width: 58,
        height: 58,

        justifyContent: "center",
        alignItems: "center",

        borderWidth: 1.5,
        borderColor: "#7FA68A",
        borderRadius: 7,
    },

    plusText: {
        color: "#E9D7A6",

        fontSize: 43,
        lineHeight: 46,
    },

    evidenceSection: {
        paddingHorizontal: 12,
        paddingTop: 11,
        paddingBottom: 13,

        marginBottom: 4,

        backgroundColor: "#1B2A2D",

        borderWidth: 1.5,
        borderColor: "#D2D0A7",
        borderRadius: 7,
    },

    sectionLabel: {
        marginBottom: 11,

        color: "#F1E8C8",

        fontFamily:
            "IBMPlexMono-Regular",

        fontSize: 14,
        lineHeight: 20,
    },

    evidenceSlots: {
        flexDirection: "row",

        gap: 9,
    },

    evidenceSlot: {
        position: "relative",

        flex: 1,
        aspectRatio: 1,

        overflow: "visible",
    },

    evidenceSlotPressable: {
        flex: 1,

        justifyContent: "center",
        alignItems: "center",

        borderWidth: 1.5,
        borderColor: "#7FA68A",
        borderRadius: 7,

        overflow: "hidden",
    },

    slotPlus: {
        color: "#E9D7A6",

        fontSize: 39,
        lineHeight: 42,
    },

    itemIconWrap: {
        justifyContent: "center",
        alignItems: "center",

        overflow: "hidden",

        borderRadius: 6,
    },

    itemSprite: {
        transform: [
            {
                translateY: 48,
            },
        ],
    },

    itemIconFallback: {
        justifyContent: "center",
        alignItems: "center",

        backgroundColor: "#31484B",

        borderRadius: 6,
    },

    itemIconFallbackText: {
        color: "#FFFFFF",

        fontSize: 25,
    },

    removeButton: {
        position: "absolute",

        top: -9,
        right: -9,

        width: 25,
        height: 25,

        justifyContent: "center",
        alignItems: "center",

        backgroundColor: "#B33A3A",

        borderRadius: 13,

        zIndex: 30,
        elevation: 30,
    },

    removeButtonText: {
        color: "#FFFFFF",

        fontSize: 18,
        lineHeight: 20,
    },

    submitButton: {
        flexShrink: 0,

        alignSelf: "center",

        minWidth: "64%",

        marginTop: 12,

        paddingHorizontal: 18,
        paddingVertical: 11,

        alignItems: "center",
        justifyContent: "center",

        backgroundColor: "#294B4D",

        borderWidth: 1.5,
        borderColor: "#E9D7A6",
        borderRadius: 7,
    },

    submitButtonDisabled: {
        opacity: 0.35,
    },

    submitButtonText: {
        color: "#FFFFFF",

        fontFamily:
            "IBMPlexMono-Regular",

        fontSize: 15,
        lineHeight: 20,

        textAlign: "center",
    },

    backButton: {
        position: "absolute",

        zIndex: 200,
        elevation: 200,

        paddingHorizontal: 20,
        paddingVertical: 11,

        justifyContent: "center",
        alignItems: "center",

        backgroundColor: "#494949",

        borderWidth: 1.5,
        borderColor: "#FFFFFF",
        borderRadius: 6,
    },

    backButtonText: {
        color: "#FFFFFF",

        fontFamily:
            "IBMPlexMono-Regular",

        fontSize: 15,
    },

    /*
     * Эти параметры повторяют рабочий
     * di_thinking из InventoryModal.
     */
    danielThinkingWrap: {
        position: "absolute",

        zIndex: 120,
        elevation: 120,

        width: 260 * SCALE,
        height: 420 * SCALE,

        justifyContent: "center",
        alignItems: "center",

        overflow: "visible",
    },

    danielThinking: {
        transform: [
            {
                translateY: 300,
            },
            {
                translateX:
                    -150 * SCALE,
            },
        ],
    },

    pickerOverlay: {
        ...StyleSheet.absoluteFillObject,

        paddingHorizontal: 12,

        justifyContent: "center",
        alignItems: "center",

        backgroundColor:
            "rgba(8, 14, 15, 0.74)",

        zIndex: 500,
        elevation: 500,
    },

    pickerFrame: {
        padding: 2,

        borderRadius: 9,

        overflow: "hidden",
    },

    pickerPanel: {
        flex: 1,
        minHeight: 0,

        paddingHorizontal: 13,
        paddingTop: 15,
        paddingBottom: 12,

        backgroundColor: "#385253",

        borderRadius: 8,

        overflow: "hidden",
    },

    pickerTitle: {
        flexShrink: 0,

        marginBottom: 13,

        color: "#F1E8C8",

        fontFamily:
            "IBMPlexMono-Bold",

        fontSize: 18,
        lineHeight: 23,

        textAlign: "center",
    },

    pickerListWrap: {
        flex: 1,
        minHeight: 0,

        overflow: "hidden",
    },

    pickerList: {
        flex: 1,
        minHeight: 0,
    },

    pickerListContent: {
        paddingBottom: 12,
    },

    emptyText: {
        paddingVertical: 30,

        color: "#F1E8C8",

        fontFamily:
            "IBMPlexMono-Regular",

        fontSize: 14,
        lineHeight: 20,

        textAlign: "center",
    },

    cancelPickerButton: {
        flexShrink: 0,

        alignSelf: "center",

        marginTop: 10,

        paddingHorizontal: 25,
        paddingVertical: 10,

        backgroundColor: "#494949",

        borderWidth: 1,
        borderColor: "#FFFFFF",
        borderRadius: 6,
    },

    cancelPickerText: {
        color: "#FFFFFF",

        fontFamily:
            "IBMPlexMono-Regular",

        fontSize: 15,
    },
});