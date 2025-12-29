import React, {useEffect, useState} from "react";
import {
    Modal,
    View,
    Text,
    ImageBackground,
    TouchableOpacity,
    ScrollView,
    Image,
    StyleSheet,
    Dimensions, TouchableWithoutFeedback,
} from "react-native";
import { useGameStore } from "@/store/gameStore";
import factsData from "@/data/facts.json";
import dossierData from "@/data/dossier.json";
import {height} from "@/styles/global";

import { RESOURCES } from "@/assets/resources";

// --- ЭКРАН ---
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// --- ИСХОДНЫЙ РАЗМЕР БЛОКНОТА (подставь реальные пропорции PNG) ---
// const DESIGN_WIDTH = 1240;
const DESIGN_WIDTH = 1240;
const DESIGN_HEIGHT = 1754;

// Масштаб так, чтобы блокнот влез по ширине и по высоте, + небольшой отступ (0.95)
const SCALE = Math.min(
    (SCREEN_WIDTH * 0.99) / DESIGN_WIDTH,
    (SCREEN_HEIGHT * 0.99) / DESIGN_HEIGHT
);

// Реальные размеры блокнота на этом устройстве
const NOTEBOOK_WIDTH = DESIGN_WIDTH * SCALE;
const NOTEBOOK_HEIGHT = DESIGN_HEIGHT * SCALE;

// Коэффициенты (как у тебя, только теперь это доли от блокнота)
const TABS_TOP_K = 0.184;
const TABS_LEFT_K = 0.132;
// const CONTENT_TOP_K = 0.23;
// const CONTENT_TOP_K = 0.275;
const CONTENT_TOP_K = 0.257;
const CONTENT_SIDE_K = 0.142;
const CONTENT_BOTTOM_K = 0.00;

const LINES_COUNT = 12; // можно поменять, если хочешь больше/меньше линеек

export default function InventoryModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
    const { data, lang, clearNewItems } = useGameStore();
    const [activeTab, setActiveTab] = useState<"facts" | "dossier" | "evidence" | "hypotheses">("facts");

    const tabs = [
        { key: "facts", label: lang === "ru" ? "ФАКТЫ" : "FACTS" },
        { key: "dossier", label: lang === "ru" ? "ДОСЬЕ" : "DOSSIER" },
        { key: "evidence", label: lang === "ru" ? "УЛИКИ" : "EVIDENCE" },
        { key: "hypotheses", label: lang === "ru" ? "ГИПОТЕЗЫ" : "HYPOTHESES" },
    ];

    useEffect(() => {
        clearNewItems();
    }, []);

    const getList = () => {
        switch (activeTab) {
            case "facts":
                return (data.facts || []).map((id: string) => factsData[id]);
            case "dossier":
                return (data.dossier || []).map((id: string) => dossierData[id][lang]);
            case "evidence":
                return data.evidence || [];
            case "hypotheses":
                return data.hypotheses || [];
            default:
                return [];
        }
    };
    const list = getList();

    type LangKey = "ru" | "en";

    const tItem = (item: any, lang: LangKey) => {
        const tr = item?.[lang] ?? {};

        return {
            name: tr.name ?? item.name ?? item.title ?? (lang === "ru" ? "Без названия" : "Untitled"),
            icon: tr.icon ?? item.icon,
            descriptionTop: tr.descriptionTop ?? item.descriptionTop ?? "",
            descriptionBottom: tr.descriptionBottom ?? item.descriptionBottom ?? "",
        };
    };

    return (
        <Modal animationType="fade" visible={visible} transparent onShow={clearNewItems}>
            <TouchableWithoutFeedback onPress={() => {}}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback onPress={onClose}>
                            <ImageBackground
                                source={require("@/assets/ui/notebook_bg.png")}
                                style={styles.notebook}
                                resizeMode="stretch" // пропорции мы уже зафиксировали через NOTEBOOK_WIDTH/HEIGHT
                            >
                                {/* Вкладки */}
                                <View style={styles.tabs}>
                                    {tabs.map((tab, index) => (
                                        <TouchableOpacity
                                            key={tab.key}
                                            style={[
                                                styles.tab,
                                                activeTab === tab.key && styles.activeTab,
                                                {borderRightWidth: index !== tabs.length-1 ? 10 * SCALE : 0}
                                            ]}
                                            onPress={() => setActiveTab(tab.key as any)}
                                        >
                                            <Text style={styles.tabText}>{tab.label}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {/* Контент */}
                                {/*<ScrollView style={styles.content}>
                                    {list.length === 0 && (
                                        <Text style={styles.emptyText}>
                                            {lang === "ru" ? "Пока ничего нет..." : "Nothing yet..."}
                                        </Text>
                                    )}

                                    {list.map((item: any, idx: number) => (
                                        <View key={idx} style={styles.entry}>
                                            <View style={styles.entryTextBlock}>
                                                <Text style={styles.entryTitle}>
                                                    {item.name || item.title || `${lang === "ru" ? "Без названия" : "Untitled"}`}
                                                </Text>
                                                {item.description && (
                                                    <Text style={styles.entryDescription}>{item.description}</Text>
                                                )}
                                            </View>
                                        </View>
                                    ))}
                                </ScrollView>*/}
                                <ScrollView style={styles.content}>
                                    {list.length === 0 && (
                                        <Text style={styles.emptyText}>
                                            {lang === "ru" ? "Пока ничего нет..." : "Nothing yet..."}
                                        </Text>
                                    )}

                                    {/*{list.map((item: any, idx: number) => (*/}
                                    {/*    <View key={idx} style={styles.entryCard}>*/}
                                    {/*        /!* Верхняя строка: номер + заголовок *!/*/}
                                    {/*        <View style={styles.entryHeaderRow}>*/}
                                    {/*            <View style={styles.entryNumberCircle}>*/}
                                    {/*                <Text style={[*/}
                                    {/*                    // {*/}
                                    {/*                    //     fontSize: lang == 'en' ? 52*SCALE : 42*SCALE,*/}
                                    {/*                    //     fontWeight: lang == 'en' ? 700: 400*/}
                                    {/*                    // },*/}
                                    {/*                    styles.entryNumberText,*/}
                                    {/*                ]}>{idx + 1}</Text>*/}
                                    {/*            </View>*/}
                                    {/*            <Text*/}
                                    {/*                style={styles.entryTitle}*/}
                                    {/*                numberOfLines={2}*/}
                                    {/*                ellipsizeMode="tail"*/}
                                    {/*            >*/}
                                    {/*                {item.name ||*/}
                                    {/*                    item.title ||*/}
                                    {/*                    (lang === "ru" ? "Без названия" : "Untitled")}*/}
                                    {/*            </Text>*/}
                                    {/*        </View>*/}

                                    {/*        /!* Нижняя часть: иконка слева + линейки с текстом справа *!/*/}
                                    {/*        /!*<View style={styles.entryBodyRow}>*!/*/}
                                    {/*        /!*    <View style={styles.entryIconBox}>*!/*/}
                                    {/*        /!*        /!* Если появятся иконки, положишь их сюда *!/*!/*/}
                                    {/*        /!*       {item.icon && (*!/*/}
                                    {/*        /!*          <Image source={item.icon} style={styles.entryIconImage} />*!/*/}
                                    {/*        /!*       )}*!/*/}
                                    {/*        /!*    </View>*!/*/}

                                    {/*        /!*    <View style={styles.entryLinesBlock}>*!/*/}
                                    {/*        /!*        /!* Линейки фона *!/*!/*/}
                                    {/*        /!*        {Array.from({ length: LINES_COUNT }).map((_, i) => (*!/*/}
                                    {/*        /!*            <View key={i} style={styles.entryLine} />*!/*/}
                                    {/*        /!*        ))}*!/*/}

                                    {/*        /!*        /!* Текст по линеечкам (поверх) *!/*!/*/}
                                    {/*        /!*        {item.description && (*!/*/}
                                    {/*        /!*            <Text style={styles.entryDescription}>{item.description}</Text>*!/*/}
                                    {/*        /!*        )}*!/*/}
                                    {/*        /!*    </View>*!/*/}
                                    {/*        /!*</View>*!/*/}

                                    {/*        <View style={styles.entryBody}>*/}
                                    {/*            /!* Иконка (абсолютно, внутри текстовой области) *!/*/}
                                    {/*            <View style={styles.entryIconBox}>*/}
                                    {/*                {item.icon && <Image source={RESOURCES[item.icon]} style={styles.entryIconImage} />}*/}
                                    {/*            </View>*/}

                                    {/*            /!* Линейки + текст *!/*/}
                                    {/*            <View style={styles.entryLinesBlock}>*/}
                                    {/*                /!* Линейки фона *!/*/}
                                    {/*                {Array.from({ length: LINES_COUNT }).map((_, i) => (*/}
                                    {/*                    <View*/}
                                    {/*                        key={i}*/}
                                    {/*                        style={[*/}
                                    {/*                            styles.entryLine,*/}
                                    {/*                            // первые строки короче, чтобы "обходить" иконку*/}
                                    {/*                            i < 4 ? styles.entryLineShort : styles.entryLineFull,*/}
                                    {/*                        ]}*/}
                                    {/*                    />*/}
                                    {/*                ))}*/}

                                    {/*                /!* Текст поверх *!/*/}
                                    {/*                /!*{item.description && (*!/*/}
                                    {/*                /!*    <Text style={styles.entryDescription}>{item.description}</Text>*!/*/}
                                    {/*                /!*)}*!/*/}

                                    {/*                {item.descriptionTop && (*/}
                                    {/*                    <>*/}
                                    {/*                        <Text*/}
                                    {/*                            style={[styles.entryDescription, styles.entryDescriptionShort]}*/}
                                    {/*                            // numberOfLines={4}*/}
                                    {/*                        >*/}
                                    {/*                            {item.descriptionTop}*/}
                                    {/*                        </Text>*/}

                                    {/*                        <Text style={[styles.entryDescription, styles.entryDescriptionFull]}>*/}
                                    {/*                            {item.descriptionBottom}*/}
                                    {/*                        </Text>*/}
                                    {/*                    </>*/}
                                    {/*                )}*/}


                                    {/*            </View>*/}
                                    {/*        </View>*/}

                                    {/*    </View>*/}
                                    {/*))}*/}

                                    {list.map((item: any, idx: number) => {
                                        const it = tItem(item, lang as any);

                                        return (
                                            <View key={idx} style={styles.entryCard}>
                                                {/* Верхняя строка: номер + заголовок */}
                                                <View style={styles.entryHeaderRow}>
                                                    <View style={styles.entryNumberCircle}>
                                                        <Text style={styles.entryNumberText}>{idx + 1}</Text>
                                                    </View>

                                                    <Text style={styles.entryTitle} numberOfLines={2} ellipsizeMode="tail">
                                                        {it.name}
                                                    </Text>
                                                </View>

                                                <View style={styles.entryBody}>
                                                    {/* Иконка */}
                                                    <View style={styles.entryIconBox}>
                                                        {it.icon ? <Image source={RESOURCES[it.icon]} style={styles.entryIconImage} /> : null}
                                                    </View>

                                                    {/* Линейки + текст */}
                                                    <View style={styles.entryLinesBlock}>
                                                        {Array.from({ length: LINES_COUNT }).map((_, i) => (
                                                            <View
                                                                key={i}
                                                                style={[
                                                                    styles.entryLine,
                                                                    i < 4 ? styles.entryLineShort : styles.entryLineFull,
                                                                ]}
                                                            />
                                                        ))}

                                                        {/* Текст */}
                                                        {!!it.descriptionTop && (
                                                            <>
                                                                <Text style={[styles.entryDescription, styles.entryDescriptionShort]}>
                                                                    {it.descriptionTop}
                                                                </Text>

                                                                {!!it.descriptionBottom && (
                                                                    <Text style={[styles.entryDescription, styles.entryDescriptionFull]}>
                                                                        {it.descriptionBottom}
                                                                    </Text>
                                                                )}
                                                            </>
                                                        )}
                                                    </View>
                                                </View>
                                            </View>
                                        );
                                    })}


                                </ScrollView>
                            </ImageBackground>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        // pointerEvents: 'none',
        flex: 1, // важно, чтобы всё заняло весь экран
        backgroundColor: "rgba(0,0,0,0.7)",
        // backgroundColor: "rgb(80, 71, 54)",
        justifyContent: "center",
        alignItems: "center",
    },

    // Блокнот ровно центруется и НИКОГДА не вылезает за экран
    notebook: {
        width: NOTEBOOK_WIDTH,
        height: NOTEBOOK_HEIGHT,
        borderRadius: 10,
        overflow: "hidden",
    },

    // вкладки привязаны к блокноту
    tabs: {
        position: "absolute",
        top: NOTEBOOK_HEIGHT * TABS_TOP_K,
        left: NOTEBOOK_WIDTH * TABS_LEFT_K,
        width: NOTEBOOK_WIDTH * (1.025 - 2 * TABS_LEFT_K),
        flexDirection: "row",
        justifyContent: "space-between",
        // backgroundColor: "#C89457",
        backgroundColor: "rgb(169 126 72)",
        borderWidth: 10 * SCALE,
        borderRadius: 10 * SCALE,
        borderColor: "#000",
    },
    tab: {
        flex: 1,
        // paddingTop: 2,
        fontFamily: "BebasNeue-Regular, sans-serif",
        paddingVertical: 8 * SCALE, // чуть масштабируем, чтобы на планшете не были микроскопическими
        // borderRightWidth: 0,
        borderColor: "#000",
        alignItems: "center",
    },
    activeTab: {
        backgroundColor: "rgb(208 154 86)",
    },
    tabText: {
        fontFamily: "BebasNeue-Regular, sans-serif",
        // fontWeight: "bold",
        color: "#2B1A0C",
        fontSize: 53 * SCALE,
    },

    // область текста внутри «страницы»
    content: {
        position: "absolute",
        top: NOTEBOOK_HEIGHT * CONTENT_TOP_K,
        left: NOTEBOOK_WIDTH * CONTENT_SIDE_K,
        right: NOTEBOOK_WIDTH * CONTENT_SIDE_K - (27*SCALE),
        bottom: NOTEBOOK_HEIGHT * CONTENT_BOTTOM_K,
    },

    entry: {
        flexDirection: "row",
        marginVertical: 8 * SCALE,
        borderBottomWidth: 1,
        borderColor: "rgba(0,0,0,0.1)",
        paddingBottom: 8 * SCALE,
    },
    entryImage: {
        width: 120 * SCALE,
        height: 120 * SCALE,
        marginRight: 10 * SCALE,
        resizeMode: "contain",
    },
    entryTextBlock: {
        flex: 1,
        justifyContent: "center",
    },
    // entryTitle: {
    //     fontWeight: "bold",
    //     color: "#2b1a0c",
    //     fontSize: 15 * SCALE,
    // },
    // entryDescription: {
    //     color: "#3b2a1b",
    //     fontSize: 13 * SCALE,
    //     lineHeight: 17 * SCALE,
    // },
    closeText: {
        color: "#fff",
        fontSize: 20 * SCALE,
    },

    emptyText: {
        textAlign: "center",
        color: "#222",
        fontStyle: "italic",
        marginTop: 20 * SCALE,
    },


    // *****************************************
    // карточка записи внутри листа
    entryCard: {
        backgroundColor: "rgba(234, 199, 143, 1)", // чуть светлее, как внутри блокнота
        borderRadius: 20 * SCALE,
        // borderWidth: 12 * SCALE,
        // borderColor: "#2b1a0c",
        paddingTop: 40 * SCALE,
        paddingBottom: 20 * SCALE,
        paddingHorizontal: 40 * SCALE,
        marginBottom: 40 * SCALE,
    },

    // верхняя строка: кружок + заголовок
    entryHeaderRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 30 * SCALE,
    },
    entryNumberCircle: {
        width: 90 * SCALE,
        height: 90 * SCALE,
        borderRadius: 45 * SCALE,
        borderWidth: 12 * SCALE,
        borderColor: "#2b1a0c",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 30 * SCALE,
    },
    entryNumberText: {
        // сюда твой номерной шрифт (например, тот же, что на вкладках)
        fontFamily: "BebasNeue-Regular",
        fontSize: 52 * SCALE,
        color: "#2b1a0c",
    },
    entryTitle: {
        flex: 1,
        color: "#2b1a0c",
        // тут лучше твой заголовочный шрифт, а не стандартный
        fontFamily: "BebasNeue-Regular", // поменяй на свой, если нужно
        fontSize: 70 * SCALE,
        lineHeight: 72 * SCALE,
    },

    entryBody: {
        position: "relative",
        minHeight: 260 * SCALE, // чтобы иконка точно помещалась
    },

    // нижняя часть: иконка + линейки
    /*entryBodyRow: {
        flexDirection: "row",
        marginTop: 10 * SCALE,
    },*/
    entryIconBox: {
        position: "absolute",
        left: 0,
        top: 10 * SCALE,
        width: 220 * SCALE,
        height: 220 * SCALE,
        borderRadius: 20 * SCALE,
        borderWidth: 12 * SCALE,
        borderColor: "#2b1a0c",
        backgroundColor: "rgba(223, 184, 123, 1)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 2,
    },
    entryIconImage: {
        width: "95%",
        height: "95%",
        resizeMode: "contain",
    },

    // блок с линеечками
    entryLinesBlock: {
        // paddingTop: 40 * SCALE,
        position: "relative",
        paddingTop: 57 * SCALE,
    },
    // каждая линейка
    entryLine: {
        borderBottomWidth: 10 * SCALE,
        borderColor: "rgba(178, 133, 77, 0.8)",
        marginBottom: 54 * SCALE,
    },

    // короткая линейка: стартует справа от иконки
    entryLineShort: {
        marginLeft: 260 * SCALE,  // 220 (иконка) + отступ
    },

    // длинная линейка: на всю ширину
    entryLineFull: {
        marginLeft: 0,
    },

    entryDescription: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,

        fontFamily: "Pacifico-Regular",
        fontSize: 50 * SCALE,
        lineHeight: 64 * SCALE,
        color: "#3b2a1b",

        // чтобы текст первые строки шёл справа от иконки:
        paddingLeft: 260 * SCALE,
    },
    entryDescriptionShort: {
        paddingLeft: 260 * SCALE,
    },
    entryDescriptionFull: {
        top: 250 * SCALE,   // ниже иконки
        paddingLeft: 0,
        // lineHeight:
    },

    entryDescTop: {
        paddingLeft: 260 * SCALE, // ширина иконки + отступ
    },

    entryDescBottom: {
        marginTop: 18 * SCALE, // небольшой отступ от верхнего блока
        paddingLeft: 0,
    },

    entryTextWrap: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        // ВАЖНО: не задаём bottom, пусть высота определяется текстом
    },

    entryTextBase: {
        fontFamily: "Pacifico-Regular",
        fontSize: 50 * SCALE,
        lineHeight: 63.2 * SCALE,
        color: "#3b2a1b",
    },
});


