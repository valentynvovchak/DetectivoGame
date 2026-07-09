import React, {useEffect, useRef, useState} from "react";
import {
    Animated,
    ImageBackground,
    Pressable,
    StyleSheet,
    TouchableOpacity,
    Image,
    View,
    Text,
    useWindowDimensions,
} from "react-native";

import dialogs from "@/data/dialogs.json";
import { useGameStore } from "@/store/gameStore";
import { globalStyles, height, width } from "@/styles/global";
import { getBackground, getSprite } from "@/tools/utils";

import CharacterSpriteNew from "@/components/CharacterSpriteNew";
import SpeechBubble from "@/components/SpeechBubble";
import MainMenu from "@/components/MainMenu";
import SceneFade from "@/components/SceneFade";

import { useLineBackground } from "@/components/scene/useLineBackground";
import { RESOURCES } from "@/assets/resources";
import { SCALE } from "@/tools/constants";
import AppText from "@/components/Common/AppText";
import ShowProofModal from "@/components/ShowProofModal";
import MakeLogicModal from "@/components/MakeLogicModal";
import hypothesesData from "@/data/hypotheses.json";

type HotspotCtx = {
    line: any;
    scene: any;
    fadeToScene: (scene: string) => void;
};

type Props = {
    onEnd?: (fadeToScene: (scene: string) => void) => void;
    canAdvance?: (line: any) => boolean;

    // ✅ новый универсальный хендлер
    onHotspotPress?: (spot: any, ctx: HotspotCtx) => void;

    // ✅ если надо глобально выключить хотспоты (например после клика)
    hotspotsDisabled?: boolean;

    renderOverlays?: (args: { line: any; fadeToScene: any }) => React.ReactNode;
};

export default function DialogScene({
      onEnd,
      canAdvance,
      onHotspotPress,
      hotspotsDisabled = false,
      renderOverlays,
    }: Props) {
    const {
        currentScene,
        currentLine,
        nextLine,
        lang,
        goToLine,
        sceneBackground,
        sceneResizeMode,
        addTask,
        completeTask,
        removeTask,
        addToData,
        unlockLocation,
        saveProgress,
        isHydrated,
        setSceneBackground,
    } = useGameStore();

    if (!isHydrated) {
        return null;
    }

    const { width: screenWidth, height: screenHeight } = useWindowDimensions();

    const isTabletScreen = screenWidth >= 700;

    const scene = (dialogs as any)[currentScene];
    const sceneDefaultBackground = scene?.background || "default";
    const activeBackground = sceneBackground || sceneDefaultBackground;
    const activeResizeMode = sceneResizeMode || scene?.resizeMode || "cover";
    const line = scene?.dialog?.[currentLine];
    const fadeAnim = useLineBackground(line, activeBackground);
    const hotspots = line?.hotspots || [];
    const executedActionsRef = useRef<Record<string, boolean>>({});

    const [proofVisible, setProofVisible] = useState(false);
    const [selectedProof, setSelectedProof] = useState<any>(null);

    const [logicVisible, setLogicVisible] = useState(false);
    const [selectedLogicItems, setSelectedLogicItems] = useState<any[]>([]);

    useEffect(() => {
        if (!scene?.background) return;

        // если фон уже восстановился из checkpoint — не трогаем
        if (sceneBackground) return;

        setSceneBackground(scene.background, scene?.resizeMode || "cover");
    }, [currentScene, scene?.background, sceneBackground]);

    const currentHypothesis =
        line?.logicResult?.hypothesisId
            ? (hypothesesData as any)[line.logicResult.hypothesisId]?.[lang]
            : null;

    const goToDialogId = (targetId: number | string) => {
        if (!scene?.dialog) return;

        const targetIndex = scene.dialog.findIndex(
            (dialogLine: any) =>
                String(dialogLine.id) === String(targetId)
        );

        if (targetIndex === -1) {
            console.warn(
                `❌ Dialog line with id "${targetId}" not found in scene "${currentScene}"`
            );
            return;
        }

        console.log(
            `➡️ Go to dialog id ${targetId}, array index ${targetIndex}`
        );

        // Потому что твой goToLine сам делает id - 1
        goToLine(targetIndex + 1);
    };

    const runActions = (dialogLine: any) => {
        if (!dialogLine?.actions || !Array.isArray(dialogLine.actions)) {
            return;
        }

        const lineId = dialogLine.id ?? currentLine;
        const actionKey = `${currentScene}_${lineId}_actions`;

        if (executedActionsRef.current[actionKey]) {
            return;
        }

        executedActionsRef.current[actionKey] = true;

        dialogLine.actions.forEach((action: any) => {
            if (!action?.type) {
                console.warn("Invalid action:", action);
                return;
            }

            switch (action.type) {
                case "add_task": {
                    if (!action.id) {
                        console.warn("Missing task id:", action);
                        return;
                    }

                    addTask(action.id);
                    break;
                }

                case "complete_task": {
                    if (!action.id) {
                        console.warn("Missing task id:", action);
                        return;
                    }

                    completeTask(action.id);
                    break;
                }

                case "remove_task": {
                    if (!action.id) {
                        console.warn("Missing task id:", action);
                        return;
                    }

                    removeTask(action.id);
                    break;
                }

                case "add_item": {
                    if (!action.category || !action.id) {
                        console.warn("Invalid add_item action:", action);
                        return;
                    }

                    addToData(action.category, action.id);
                    break;
                }

                case "unlock_location": {
                    if (!action.id) {
                        console.warn("Missing location id:", action);
                        return;
                    }

                    unlockLocation(action.id);
                    break;
                }

                case "save_checkpoint": {
                    saveProgress();
                    console.log("💾 Checkpoint saved:", currentScene, currentLine);
                    break;
                }

                default:
                    console.warn("Unknown action type:", action.type, action);
                    break;
            }
        });
    };

    useEffect(() => {
        if (!isHydrated) return;
        if (!line) return;

        runActions(line);
    }, [isHydrated, currentScene, currentLine, line]);

    return (
        <SceneFade>
            {(fadeToScene) => (
                <Pressable
                    style={{ flex: 1 }}
                    onPress={() => {
                        if (!scene?.dialog) return;

                        // ✅ SHOW PROOF RESULT
                        if (line?.proofResult?.type === "wrong" && line?.proofResult?.retryLine) {
                            setSelectedProof(null);
                            goToLine(line.proofResult.retryLine);
                            return;
                        }

                        if (line?.proofResult?.type === "correct" && line?.proofResult?.continueLine) {
                            setSelectedProof(null);
                            goToLine(line.proofResult.continueLine);
                            return;
                        }

                        // ✅ MAKE LOGIC RESULT
                        if (
                            line?.logicResult?.type === "wrong" &&
                            line?.logicResult?.retryLine
                        ) {
                            setSelectedLogicItems([]);
                            goToDialogId(line.logicResult.retryLine);
                            return;
                        }

                        if (
                            line?.logicResult?.type === "correct" &&
                            line?.logicResult?.continueLine
                        ) {
                            setSelectedLogicItems([]);
                            goToDialogId(line.logicResult.continueLine);
                            return;
                        }

                        const hasShowProof = !!line?.showProof;
                        const hasMakeLogic = !!line?.makeLogic;
                        const tapToContinue = line?.tapToContinue !== false;

                        const canAdvanceByDefault =
                            tapToContinue && hotspots.length === 0 && !hasShowProof && !hasMakeLogic;

                        const isLast = currentLine >= scene.dialog.length - 1;
                        const ok = canAdvance ? canAdvance(line) : canAdvanceByDefault;

                        if (!ok) return;

                        if (isLast) {
                            onEnd?.(fadeToScene);
                            return;
                        }

                        nextLine();
                    }}
                >
                    <ImageBackground
                        key={activeBackground}
                        source={getBackground(activeBackground)}
                        resizeMode={activeResizeMode}
                        style={globalStyles.screen}
                    >
                        {/* characters */}
                        {line?.bubble_mode !== 'avatar' && line?.characters?.map((char: any) => (
                            <CharacterSpriteNew
                                key={char.id}
                                mode={char.mode}
                                side={char.side}
                                Sprite={getSprite(char.sprite)}
                                isSpeaking={char.id === line.speaker}
                                heightModifier={char?.height_modifier}
                                proofResult={line?.proofResult}
                            />
                        ))}

                        {/* speech */}
                        {line?.speaker && (
                            <SpeechBubble
                                side={line?.characters?.find((c: any) => c.id === line.speaker)?.side || "center"}
                                speaker={line.speaker}
                                text={lang === "ru" ? line.text.ru : line.text.en}
                                mode={line?.bubble_mode || "medium"}
                                charMode={line?.characters?.find((c: any) => c.id === line.speaker)?.mode}
                                lang={lang}
                                avatarSprite={line?.characters?.[0]?.sprite}
                                avatarBg={line?.characters?.[0]?.bg}
                            />
                        )}

                        {line?.logicResult?.type === "correct" &&
                            line?.logicResult?.showHypothesis &&
                            currentHypothesis && (
                                <View
                                    pointerEvents="none"
                                    style={[
                                        styles.hypothesisResultWrap,
                                        {
                                            top: isTabletScreen
                                                ? screenHeight * 0.075
                                                : screenHeight * 0.08,
                                        },
                                    ]}
                                >
                                    <View
                                        style={[
                                            styles.hypothesisResultCard,
                                            {
                                                width: isTabletScreen
                                                    ? Math.min(screenWidth * 0.57, 520)
                                                    : Math.min(screenWidth * 0.67, 390),
                                            },
                                        ]}
                                    >
                                        {!!currentHypothesis.icon &&
                                            !!RESOURCES[currentHypothesis.icon] && (
                                                <Image
                                                    source={RESOURCES[currentHypothesis.icon]}
                                                    style={[
                                                        styles.hypothesisResultImage,
                                                        {
                                                            width: isTabletScreen
                                                                ? Math.min(screenWidth * 0.42, 340)
                                                                : Math.min(screenWidth * 0.58, 300),

                                                            height: isTabletScreen
                                                                ? Math.min(screenHeight * 0.21, 360)
                                                                : Math.min(screenHeight * 0.27, 350),
                                                        },
                                                    ]}
                                                />
                                            )}

                                        <View style={styles.hypothesisResultDescription}>
                                            <AppText
                                                style={[
                                                    styles.hypothesisResultDescriptionText,
                                                    {
                                                        fontSize: isTabletScreen ? 16 : 14,
                                                        lineHeight: isTabletScreen ? 21 : 19,
                                                    },
                                                ]}
                                            >
                                                {currentHypothesis.short_description ||
                                                    currentHypothesis.name}
                                            </AppText>
                                        </View>
                                    </View>
                                </View>
                            )}

                        {line?.makeLogic && (
                            <View pointerEvents="box-none" style={styles.logicButtonWrap}>
                                <TouchableOpacity
                                    activeOpacity={0.85}
                                    style={styles.logicButton}
                                    onPress={() => setLogicVisible(true)}
                                >
                                    <AppText style={styles.logicButtonText}>
                                        {line.makeLogic.buttonText?.[lang] ||
                                            line.makeLogic.buttonText?.en ||
                                            (lang === "ru" ? "Собрать логику!" : "Make logic!")}
                                    </AppText>
                                </TouchableOpacity>
                            </View>
                        )}

                        {line?.logicResult?.type === "wrong" &&
                            line?.logicResult?.showSelectedItems &&
                            selectedLogicItems.length > 0 && (
                                <View pointerEvents="none" style={styles.logicSelectedWrap}>
                                    {selectedLogicItems.map((item) => (
                                        <View
                                            key={`${item.category}_${item.id}`}
                                            style={styles.logicSelectedCard}
                                        >
                                            {!!item.icon && !!RESOURCES[item.icon] && (
                                                <Image
                                                    source={RESOURCES[item.icon]}
                                                    style={styles.logicSelectedIcon}
                                                />
                                            )}

                                            <AppText style={styles.logicSelectedText}>
                                                {item.short_description || item.name}
                                            </AppText>
                                        </View>
                                    ))}
                                </View>
                            )
                        }

                        {line?.logicResult && (
                            <View pointerEvents="none" style={styles.logicResultBadgeWrap}>
                                <View
                                    style={[
                                        styles.logicResultBadge,
                                        line.logicResult.type === "wrong"
                                            ? styles.logicResultBadgeWrong
                                            : styles.logicResultBadgeCorrect,
                                    ]}
                                >
                                    <AppText style={styles.logicResultText}>
                                        {line.logicResult.message?.[lang] ||
                                            line.logicResult.message?.en ||
                                            ""}
                                    </AppText>
                                </View>
                            </View>
                        )}

                        {line?.proofResult?.showSelectedItem && selectedProof && (
                            <View
                                style={[
                                    styles.selectedProofCard,
                                    line.proofResult.type === "wrong" && styles.selectedProofCardWrong,
                                ]}
                            >
                                {!!selectedProof.icon && !!RESOURCES[selectedProof.icon] && (
                                    <Image
                                        source={RESOURCES[selectedProof.icon]}
                                        style={styles.selectedProofIcon}
                                    />
                                )}

                                <AppText style={styles.selectedProofText} numberOfLines={2}>
                                    {selectedProof.short_description ||
                                        selectedProof.name ||
                                        selectedProof.description}
                                </AppText>
                            </View>
                        )}

                        {line?.proofResult && (
                            <View pointerEvents="none" style={styles.proofResultBadgeWrap}>
                                <View
                                    style={[
                                        styles.proofResultBadge,
                                        line.proofResult.type === "wrong"
                                            ? styles.proofResultBadgeWrong
                                            : styles.proofResultBadgeCorrect,
                                    ]}
                                >
                                    <AppText style={styles.proofResultText}>
                                        {line.proofResult.message?.[lang] ||
                                            line.proofResult.message?.en ||
                                            ""}
                                    </AppText>
                                </View>
                            </View>
                        )}

                        {/* ✅ hotspots (универсально) */}
                        {hotspots.map((spot: any) => (
                            <TouchableOpacity
                                key={spot.id}
                                disabled={hotspotsDisabled || !onHotspotPress}
                                onPress={() => onHotspotPress?.(spot, { line, scene, fadeToScene })}
                                style={[
                                    styles.hotspot,
                                    { left: width * spot.x, top: height * spot.y },
                                ]}
                            >
                                {!!spot?.icon && (
                                    <Image
                                        source={RESOURCES[spot.icon]}
                                        style={{
                                            height: height * spot.height,
                                            width: width * spot.width,
                                            resizeMode: "contain",
                                        }}
                                    />
                                )}

                                {!!spot?.breadcrumb && (
                                    <View style={styles.breadcrumbWrap}>
                                        <AppText style={styles.breadcrumbText}>{spot.breadcrumb}</AppText>
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}

                        {/* overlays */}
                        {renderOverlays?.({ line, fadeToScene })}

                        {line?.showProof && (
                            <ShowProofModal
                                visible={proofVisible}
                                proof={line.showProof}
                                onClose={() => setProofVisible(false)}
                                onResult={({ correct, item }) => {
                                    setProofVisible(false);
                                    setSelectedProof(item);

                                    if (correct) {
                                        if (line.showProof.successLine) {
                                            goToLine(line.showProof.successLine);
                                        } else {
                                            nextLine();
                                        }

                                        return;
                                    }

                                    if (line.showProof.wrongLine) {
                                        goToLine(line.showProof.wrongLine);
                                    }
                                }}
                            />
                        )}

                        {line?.makeLogic && (
                            <MakeLogicModal
                                visible={logicVisible}
                                logic={line.makeLogic}
                                onClose={() => setLogicVisible(false)}
                                onResult={({ correct, items }) => {
                                    console.log("🧠 MAKE LOGIC RESULT:", {
                                        correct,
                                        selected: items.map((item: any) => ({
                                            category: item.category,
                                            id: item.id,
                                        })),
                                        successLine: line.makeLogic.successLine,
                                        wrongLine: line.makeLogic.wrongLine,
                                    });

                                    setLogicVisible(false);
                                    setSelectedLogicItems(items);

                                    if (correct) {
                                        if (line.makeLogic.successLine) {
                                            goToDialogId(line.makeLogic.successLine);
                                        } else {
                                            nextLine();
                                        }

                                        return;
                                    }

                                    if (line.makeLogic.wrongLine) {
                                        goToDialogId(line.makeLogic.wrongLine);
                                    }
                                }}
                            />
                        )}

                        {line?.showProof && (
                            <View pointerEvents="box-none" style={styles.showProofButtonWrap}>
                                <TouchableOpacity
                                    activeOpacity={0.85}
                                    style={styles.showProofButton}
                                    onPress={() => setProofVisible(true)}
                                >
                                    <AppText style={styles.showProofText}>
                                        {line.showProof.buttonText?.[lang] ||
                                            line.showProof.buttonText?.en ||
                                            (lang === "ru" ? "Показать доказательство" : "Show proof")}
                                    </AppText>
                                </TouchableOpacity>
                            </View>
                        )}

                        {line?.menu !== false && <MainMenu />}

                        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]} />
                    </ImageBackground>
                </Pressable>
            )}
        </SceneFade>
    );
}

const styles = StyleSheet.create({
    hotspot: { position: "absolute" },

    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "black",
        zIndex: 999,
        pointerEvents: "none",
    },

    breadcrumbWrap: {
        position: "absolute",
        top: 40 * SCALE,
        left: 20 * SCALE,
        backgroundColor: "#EA0F12",
        paddingHorizontal: 24 * SCALE,
        paddingVertical: 10 * SCALE,
        borderRadius: 999,
        alignSelf: "flex-start",
        elevation: 6,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    breadcrumbText: {
        color: "#fff",
        // fontFamily: "BebasNeue-Regular",
        fontFamily: "IBMPlexMono-Regular",
        fontSize: 56 * SCALE,
        letterSpacing: 1,
    },
    showProofButtonWrap: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: height * 0.17,
        alignItems: "center",
        zIndex: 120,
        elevation: 120,
    },
    showProofButton: {
        minWidth: width * 0.34,
        backgroundColor: "rgba(41, 79, 75, 0.95)",
        borderWidth: 2,
        borderColor: "#E9DEC1",
        borderRadius: 6,
        paddingVertical: 10,
        paddingHorizontal: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    showProofText: {
        color: "#FFFFFF",
        fontSize: 16 * 3 * SCALE,
        fontFamily: "IBMPlexMono-Regular",
        textTransform: "lowercase",
    },

    selectedProofCard: {
        position: "absolute",
        top: height * 0.11,
        alignSelf: "center",
        width: width * 0.52,
        minHeight: height * 0.12,
        backgroundColor: "rgba(33, 55, 54, 0.96)",
        borderWidth: 2,
        borderColor: "#E9DEC1",
        borderRadius: 6,
        padding: 8,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 160,
        elevation: 130,
    },

    selectedProofCardWrong: {
        top: height * 0.11,
    },

    selectedProofIcon: {
        width: width * 0.24,
        height: width * 0.24,
        resizeMode: "cover",
        borderRadius: 4,
        marginBottom: 6,
    },

    selectedProofText: {
        paddingBottom: 6 * SCALE,
        color: "#FFFFFF",
        fontSize: 13 * 3 * SCALE,
        lineHeight: 20 * 3 * SCALE,
        textAlign: "center",
        fontFamily: "IBMPlexMono-Regular",
    },
    proofResultBadgeWrap: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: height * 0.18,
        alignItems: "center",
        zIndex: 130,
        elevation: 130,
    },

    proofResultBadge: {
        minWidth: width * 0.28,
        maxWidth: width * 0.75,
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center",
    },

    proofResultBadgeCorrect: {
        backgroundColor: "rgba(41, 79, 75, 0.96)",
        borderWidth: 2,
        borderColor: "#E9DEC1",
    },

    proofResultBadgeWrong: {
        backgroundColor: "#EA2118",
        borderWidth: 2,
        borderColor: "#EA2118",
    },

    proofResultText: {
        color: "#FFFFFF",
        fontSize: 15 * 3 * SCALE,
        lineHeight: 19 * 3 * SCALE,
        fontFamily: "IBMPlexMono-Regular",
        fontWeight: "700",
        textAlign: "center",
    },

    logicButtonWrap: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: height * 0.17,
        alignItems: "center",
        zIndex: 130,
        elevation: 130,
    },

    logicButton: {
        minWidth: width * 0.34,
        backgroundColor: "rgba(41, 79, 75, 0.95)",
        borderWidth: 2,
        borderColor: "#E9DEC1",
        borderRadius: 6,
        paddingVertical: 10,
        paddingHorizontal: 18,
        alignItems: "center",
        justifyContent: "center",
    },

    logicButtonText: {
        color: "#FFFFFF",
        fontSize: 14 * 3 * SCALE,
        fontFamily: "IBMPlexMono-Regular",
        textTransform: "lowercase",
    },

    logicSelectedWrap: {
        position: "absolute",
        top: height * 0.08,
        left: 0,
        right: 0,
        alignItems: "center",
        zIndex: 130,
        elevation: 130,
        gap: 8,
    },

    logicSelectedCard: {
        width: width * 0.58,
        minHeight: 72,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(33, 55, 54, 0.96)",
        borderWidth: 2,
        borderColor: "#E9DEC1",
        borderRadius: 6,
        padding: 7,
    },

    logicSelectedIcon: {
        width: 58,
        height: 58,
        resizeMode: "cover",
        borderRadius: 5,
        marginRight: 8,
    },

    logicSelectedText: {
        flex: 1,
        color: "#FFFFFF",
        fontSize: 11,
        lineHeight: 15,
        fontFamily: "IBMPlexMono-Regular",
    },

    logicResultBadgeWrap: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: height * 0.18,
        alignItems: "center",
        zIndex: 130,
        elevation: 130,
    },

    logicResultBadge: {
        minWidth: width * 0.34,
        maxWidth: width * 0.8,
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center",
    },

    logicResultBadgeCorrect: {
        backgroundColor: "rgba(41, 79, 75, 0.96)",
        borderWidth: 2,
        borderColor: "#E9DEC1",
    },

    logicResultBadgeWrong: {
        backgroundColor: "#EA2118",
        borderWidth: 2,
        borderColor: "#EA2118",
    },

    logicResultText: {
        color: "#FFFFFF",
        fontSize: 15,
        lineHeight: 19,
        fontFamily: "IBMPlexMono-Regular",
        fontWeight: "700",
        textAlign: "center",
    },

    hypothesisResultWrap: {
        position: "absolute",

        left: 0,
        right: 0,

        alignItems: "center",

        zIndex: 140,
        elevation: 140,
    },

    hypothesisResultCard: {
        backgroundColor: "rgba(48, 82, 78, 0.98)",

        borderWidth: 2,
        borderColor: "#E9DEC1",

        borderRadius: 7,

        padding: 12,

        alignItems: "center",
    },

    hypothesisResultImage: {
        resizeMode: "cover",

        borderRadius: 6,

        marginBottom: 12,
    },

    hypothesisResultDescription: {
        width: "100%",

        backgroundColor: "#F7F2E7",

        borderRadius: 5,

        paddingHorizontal: 10,
        paddingVertical: 8,

        minHeight: 48,

        justifyContent: "center",
    },

    hypothesisResultDescriptionText: {
        color: "#4A5655",

        textAlign: "center",

        fontFamily: "IBMPlexMono-Regular",
    },
});