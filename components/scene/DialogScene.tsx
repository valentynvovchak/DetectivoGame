import React, {useEffect, useMemo, useRef, useState} from "react";
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
import {globalStyles, height, isSmallScreen, isTablet, width} from "@/styles/global";
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
import LogicChoiceModal from "@/components/LogicChoiceModal";
import {LinearGradient} from "react-native-svg";
import MixedIcon from "@/components/Common/MixedIcon";
import ClueFlyAnimation from "@/components/animations/ClueFlyAnimation";
import factsData from "@/data/facts.json";
import {
    DialogBubbleMode, doesTextFitBubble,
    paginateDialogText,
} from "@/tools/paginateDialogText";
import NextStepChoiceModal from "@/components/NextStepChoiceModal";
import PrisonBarsAnimation from "@/components/animations/PrisonBarsAnimation";
import AnimatedCharacterTest from "@/assets/animations/AnimatedCharacterTest";

type FactAnimationState = {
    id: string;
    text: string;
    icon: string;
};

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
    renderTopOverlays?: (args: {
        line: any;
        fadeToScene: any;
    }) => React.ReactNode;
};

export default function DialogScene({
      onEnd,
      canAdvance,
      onHotspotPress,
      hotspotsDisabled = false,
      renderOverlays,
      renderTopOverlays,
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
        goBackDialog,
        dialogHistory,
        loseHp,
        hasItem,
        clearTasks,
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
    const [logicChoiceVisible, setLogicChoiceVisible] = useState(false);

    const [activeFactAnimation, setActiveFactAnimation] = useState<FactAnimationState | null>(null);
    const factAnimationResolveRef = useRef<(() => void) | null>(null);
    const [nextStepChoiceVisible, setNextStepChoiceVisible] = useState(false);

    const isPrisonBarsEffect =
        line?.sceneEffect === "prison_bars";

    const [
        prisonBarsFinished,
        setPrisonBarsFinished,
    ] = useState(true);

    useEffect(() => {
        /*
         * На реплике с решёткой запрещаем дальнейшее
         * переключение, пока она не упадёт.
         */
        if (isPrisonBarsEffect) {
            setPrisonBarsFinished(false);
            return;
        }

        setPrisonBarsFinished(true);
    }, [
        currentScene,
        currentLine,
        isPrisonBarsEffect,
    ]);

    useEffect(() => {
        if (!scene?.background) return;

        // если фон уже восстановился из checkpoint — не трогаем
        if (sceneBackground) return;

        setSceneBackground(scene.background, scene?.resizeMode || "cover");
    }, [currentScene, scene?.background, sceneBackground]);

    const hypothesisId =
        line?.logicResult?.hypothesisId ||
        line?.choiceResult?.hypothesisId;

    const currentHypothesis =
        hypothesisId
            ? (hypothesesData as any)[hypothesisId]?.[lang]
            : null;

    const shouldShowHypothesis =
        (
            line?.logicResult?.type === "correct" &&
            line?.logicResult?.showHypothesis
        ) ||
        (
            line?.choiceResult?.type === "correct" &&
            line?.choiceResult?.showHypothesis
        );

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

    const runActions = async (dialogLine: any) => {
        if (
            !dialogLine?.actions ||
            !Array.isArray(dialogLine.actions)
        ) {
            return;
        }

        const lineId = dialogLine.id ?? currentLine;
        const actionKey =
            `${currentScene}_${lineId}_actions`;

        if (executedActionsRef.current[actionKey]) {
            return;
        }

        executedActionsRef.current[actionKey] = true;

        for (const action of dialogLine.actions) {
            if (!action?.type) {
                console.warn("Invalid action:", action);
                continue;
            }

            switch (action.type) {
                case "add_task": {
                    if (!action.id) {
                        console.warn("Missing task id:", action);
                        break;
                    }

                    addTask(action.id);
                    break;
                }
                case "complete_task": {
                    if (!action.id) {
                        console.warn("Missing task id:", action);
                        break;
                    }

                    completeTask(action.id);
                    break;
                }
                case "remove_task": {
                    if (!action.id) {
                        console.warn("Missing task id:", action);
                        break;
                    }

                    removeTask(action.id);
                    break;
                }
                case "add_item": {
                    if (!action.category || !action.id) {
                        console.warn(
                            "Invalid add_item action:",
                            action
                        );

                        break;
                    }
                    /*
                     * Факты автоматически показывают
                     * анимацию перед добавлением.
                     */
                    if (
                        action.category === "facts" &&
                        action.animate !== false
                    ) {
                        await playFactAnimation(
                            action.id,
                            action
                        );
                    } else {
                        addToData(
                            action.category,
                            action.id
                        );
                    }
                    break;
                }
                case "unlock_location": {
                    if (!action.id) {
                        console.warn(
                            "Missing location id:",
                            action
                        );
                        break;
                    }
                    unlockLocation(action.id);
                    break;
                }
                case "save_checkpoint": {
                    await saveProgress();
                    console.log(
                        "💾 Checkpoint saved:",
                        currentScene,
                        currentLine
                    );
                    break;
                }
                case "clear_tasks": {
                    clearTasks();
                    break;
                }
                case "lose_hp": {
                    const amount =
                        typeof action.amount === "number"
                            ? action.amount
                            : 1;

                    loseHp(amount);
                    break;
                }
                default:
                    console.warn(
                        "Unknown action type:",
                        action.type,
                        action
                    );
                    break;
            }
        }
    };

    useEffect(() => {
        if (!isHydrated || !line) return;

        void runActions(line);
    }, [
        isHydrated,
        currentScene,
        currentLine,
        line,
    ]);

    const playFactAnimation = (
        factId: string,
        action?: any
    ): Promise<void> => {
        return new Promise<void>((resolve) => {
            if (hasItem("facts", factId)) {
                resolve();
                return;
            }

            const localizedFact =
                (factsData as any)?.[factId]?.[lang];

            if (!localizedFact) {
                console.warn(
                    `Fact "${factId}" not found in facts.json`
                );

                addToData("facts", factId);
                resolve();
                return;
            }

            const icon = localizedFact.icon;

            // Для анимации иконка обязательна
            if (
                typeof icon !== "string" ||
                icon.trim().length === 0
            ) {
                console.warn(
                    `Fact "${factId}" does not have a valid icon`
                );

                // Добавляем факт без анимации
                addToData("facts", factId);
                resolve();
                return;
            }

            const customText =
                action?.animationText?.[lang];

            factAnimationResolveRef.current =
                () => resolve();

            setActiveFactAnimation({
                id: factId,

                text:
                    customText ||
                    localizedFact.name ||
                    localizedFact.short_description ||
                    factId,

                icon,
            });
        });
    };

    const handleFactAnimationFinish = () => {
        const animation = activeFactAnimation;

        if (!animation) {
            return;
        }

        const factId = animation.id;

        addToData("facts", factId);

        setActiveFactAnimation(null);

        const resolve =
            factAnimationResolveRef.current;

        factAnimationResolveRef.current = null;

        resolve?.();
    };

    const localizedDialogText =
        line?.text?.[lang] ||
        line?.text?.en ||
        "";

    const manuallySpecifiedPages =
        line?.text_pages?.[lang];

    const isNarrator =
        line?.speaker === "Narrator" ||
        line?.speaker === "Narrator2" ||
        line?.speaker === "JudgeNarrator" ||
        line?.speaker === "Narrator3" ||
        line?.speaker === "NarratorWhite" ||
        line?.speaker === "SidePanel" ||
        line?.bubble_mode === "dark" ;

    const textPages = useMemo(() => {
        /*
         * Narrator всегда показывает весь текст
         * одним окном и не участвует в пагинации.
         */
        if (isNarrator) {
            return [localizedDialogText];
        }

        // Ручное разделение конкретной реплики
        if (
            Array.isArray(manuallySpecifiedPages) &&
            manuallySpecifiedPages.length > 0
        ) {
            return manuallySpecifiedPages;
        }

        // Отключение пагинации через dialogs.json
        if (line?.auto_paginate === false) {
            return [localizedDialogText];
        }

        return paginateDialogText({
            text: localizedDialogText,

            mode:
                (line?.bubble_mode ||
                    "medium") as DialogBubbleMode,

            screenWidth,

            isTablet: isTabletScreen,
            isSmallScreen,

            maxLines:
                line?.max_text_lines ?? 3,

            minLastPageWords:
                line?.min_last_page_words ?? 4,
        });
    }, [
        currentScene,
        currentLine,
        line?.id,
        line?.bubble_mode,
        line?.speaker,
        line?.auto_paginate,
        line?.max_text_lines,
        manuallySpecifiedPages,
        localizedDialogText,
        screenWidth,
        isTabletScreen,
        isNarrator,
    ]);

    const [
        textPageIndex,
        setTextPageIndex,
    ] = useState(0);

    useEffect(() => {
        setTextPageIndex(0);
    }, [
        currentScene,
        currentLine,
        lang,
    ]);

    const visibleDialogText =
        textPages[textPageIndex] ||
        localizedDialogText;

    const originalBubbleMode =
        (line?.bubble_mode ||
            "medium") as DialogBubbleMode;

    const visibleBubbleMode =
        useMemo<DialogBubbleMode>(() => {
            /*
             * Первую часть всегда показываем
             * в режиме из dialogs.json.
             */
            if (textPageIndex === 0) {
                return originalBubbleMode;
            }

            /*
             * Автоматически уменьшаем только large.
             * Остальные специальные режимы не трогаем.
             */
            if (originalBubbleMode !== "large") {
                return originalBubbleMode;
            }

            /*
             * Возможность отключить автоматику
             * для конкретной реплики.
             */
            if (
                line?.auto_shrink_continuation === false
            ) {
                return originalBubbleMode;
            }

            const fitsMedium =
                doesTextFitBubble({
                    text: visibleDialogText,
                    mode: "medium",

                    screenWidth,
                    isTablet: isTabletScreen,
                    isSmallScreen,

                    maxLines:
                        line?.max_text_lines ?? 3,
                });

            return fitsMedium
                ? "medium"
                : "large";
        }, [
            originalBubbleMode,
            textPageIndex,
            visibleDialogText,
            screenWidth,
            isTabletScreen,
            line?.max_text_lines,
            line?.auto_shrink_continuation,
        ]);

    const isLastTextPage =
        textPageIndex >= textPages.length - 1;

    // const displayedHotspots = isLastTextPage ? hotspots : [];
    const displayedHotspots = hotspots;
    const interactiveHotspots = displayedHotspots.filter(
        (spot: any) => spot.type !== "inactive"
    );


    return (
        <SceneFade>
            {(fadeToScene) => (
                <Pressable
                    style={{ flex: 1 }}
                    onPress={() => {
                        if (!scene?.dialog) {
                            return;
                        }

                        if (activeFactAnimation) {
                            return;
                        }

                        if (
                            isPrisonBarsEffect &&
                            !prisonBarsFinished
                        ) {
                            return;
                        }

                        /*
                         * Сначала показываем следующую часть
                         * текущей реплики. currentLine при этом
                         * не меняется.
                         */
                        if (!isLastTextPage) {
                            setTextPageIndex(
                                (previous) => previous + 1
                            );

                            return;
                        }

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

                        // LOGIC CHOICE — wrong
                        if (
                            line?.choiceResult?.type === "wrong" &&
                            line?.choiceResult?.retryLine
                        ) {
                            goToDialogId(
                                line.choiceResult.retryLine
                            );

                            return;
                        }

                        // LOGIC CHOICE — correct
                        if (
                            line?.choiceResult?.type === "correct" &&
                            line?.choiceResult?.continueLine
                        ) {
                            goToDialogId(
                                line.choiceResult.continueLine
                            );

                            return;
                        }

                        const hasShowProof = !!line?.showProof;
                        const hasMakeLogic = !!line?.makeLogic;
                        const hasLogicChoice = !!line?.logicChoice;
                        const tapToContinue = line?.tapToContinue !== false;
                        const hasNextStepChoice = !!line?.nextStepChoice;

                        const canAdvanceByDefault =
                            tapToContinue &&
                            interactiveHotspots.length === 0 &&
                            !hasShowProof &&
                            !hasMakeLogic &&
                            !hasLogicChoice &&
                            !hasNextStepChoice;

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
                        <View
                            pointerEvents="box-none"
                            style={styles.hotspotsLayer}
                        >
                            {displayedHotspots.map((spot: any) => {
                                if (spot.type === "inactive") {
                                    return (
                                        <View
                                            key={spot.id}
                                            pointerEvents="none"
                                            style={[
                                                styles.hotspot,
                                                {
                                                    left: width * (spot.x ?? 0),
                                                    top: height * (spot.y ?? 0),
                                                },
                                            ]}
                                        >
                                            {!!spot?.icon && !!RESOURCES[spot.icon] && (
                                                <Image
                                                    source={RESOURCES[spot.icon]}
                                                    style={{
                                                        height:
                                                            height *
                                                            (spot.height ?? 0.1),

                                                        width:
                                                            width *
                                                            (spot.width ?? 0.1),

                                                        resizeMode: "contain",
                                                    }}
                                                />
                                            )}
                                        </View>
                                    );
                                }
                                if (spot.type === "button") {
                                    const buttonWidth = width * (spot.width ?? 0.4);

                                    const buttonHeight = spot.height
                                        ? height * spot.height
                                        : 56;

                                    return (
                                        <TouchableOpacity
                                            key={spot.id}
                                            activeOpacity={0.8}
                                            disabled={hotspotsDisabled || !onHotspotPress}
                                            onPress={(event) => {
                                                event.stopPropagation();

                                                onHotspotPress?.(spot, {
                                                    line,
                                                    scene,
                                                    fadeToScene,
                                                });
                                            }}
                                            style={[
                                                styles.hotspotButtonTouch,
                                                {
                                                    left: width * (spot.x ?? 0),
                                                    top: height * (spot.y ?? 0),
                                                    width: buttonWidth,
                                                    height: buttonHeight,
                                                },
                                            ]}
                                        >
                                            <LinearGradient
                                                colors={["#CCCCCC", "#CACA99"]}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 0, y: 1 }}
                                                style={StyleSheet.absoluteFill}
                                            />

                                            <View style={styles.hotspotButtonInner}>
                                                <AppText style={styles.hotspotButtonText}>
                                                    {spot.text?.[lang] ||
                                                        spot.text?.en ||
                                                        spot.text?.ru ||
                                                        "Button"}
                                                </AppText>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                }

                                return (
                                    <TouchableOpacity
                                        key={spot.id}
                                        disabled={hotspotsDisabled || !onHotspotPress}
                                        activeOpacity={0.85}
                                        onPress={(event) => {
                                            event.stopPropagation();

                                            onHotspotPress?.(spot, {
                                                line,
                                                scene,
                                                fadeToScene,
                                            });
                                        }}
                                        style={[
                                            styles.hotspot,
                                            {
                                                left: width * (spot.x ?? 0),
                                                top: height * (spot.y ?? 0),
                                            },
                                        ]}
                                    >
                                        {!!spot?.icon && !!RESOURCES[spot.icon] && (
                                            <Image
                                                source={RESOURCES[spot.icon]}
                                                style={{
                                                    height: height * (spot.height ?? 0.1),
                                                    width: width * (spot.width ?? 0.1),
                                                    resizeMode: "contain",
                                                }}
                                            />
                                        )}

                                        {!!spot?.breadcrumb && (
                                            <View style={styles.breadcrumbWrap}>
                                                <AppText style={styles.breadcrumbText}>
                                                    {typeof spot.breadcrumb === "object"
                                                        ? spot.breadcrumb?.[lang] ||
                                                        spot.breadcrumb?.en ||
                                                        ""
                                                        : spot.breadcrumb}
                                                </AppText>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* characters */}
                        {/*<View
                            // pointerEvents="none"
                            style={styles.charactersLayer}
                        >
                            {line?.bubble_mode !== 'avatar' && line?.characters?.map((char: any) => (
                                <CharacterSpriteNew
                                    key={char.id}
                                    mode={char.mode}
                                    side={char.side}
                                    Sprite={getSprite(char.sprite)}
                                    isSpeaking={char.id === line.speaker}
                                    heightModifier={char?.height_modifier}
                                    yModifier={char?.y_modifier ?? 0}
                                    proofResult={line?.proofResult}
                                />
                            ))}
                        </View>*/}

                        {/* characters */}
                        <View pointerEvents="none" style={styles.charactersLayer}>
                            {line?.bubble_mode !== "avatar" && (
                                <>
                                    {line?.animatedCharacterTest ? (
                                        <AnimatedCharacterTest />
                                    ) : (
                                        line?.characters?.map(
                                            (char: any) => (
                                                <CharacterSpriteNew
                                                    key={char.id}
                                                    mode={char.mode}
                                                    side={char.side}
                                                    Sprite={getSprite(
                                                        char.sprite
                                                    )}
                                                    isSpeaking={
                                                        char.id ===
                                                        line.speaker
                                                    }
                                                    heightModifier={
                                                        char?.height_modifier
                                                    }
                                                    yModifier={
                                                        char?.y_modifier ??
                                                        0
                                                    }
                                                    proofResult={
                                                        line?.proofResult
                                                    }
                                                />
                                            )
                                        )
                                    )}
                                </>
                            )}
                        </View>

                        {/* speech */}
                        {line?.speaker && (
                            <SpeechBubble
                                side={line?.characters?.find((c: any) => c.id === line.speaker)?.side || "center"}
                                speaker={line.speaker}
                                text={visibleDialogText}
                                mode={visibleBubbleMode}
                                charMode={line?.characters?.find((c: any) => c.id === line.speaker)?.mode}
                                lang={lang}
                                // SVG
                                avatarSprite={line?.characters?.[0]?.sprite}
                                // PNG
                                avatarImage={line?.characters?.[0]?.image}
                                avatarBg={line?.characters?.[0]?.bg}
                                avatarPosition={line?.characters?.[0]?.position}
                            />
                        )}

                        {(
                                typeof line?.backLine === "number" ||
                                textPageIndex > 0 ||
                                dialogHistory.length > 0
                            ) &&
                            !proofVisible &&
                            !logicVisible &&
                            !logicChoiceVisible &&
                            !nextStepChoiceVisible &&
                            line?.allowBack !== false && (
                                // <TouchableOpacity
                                //     activeOpacity={0.85}
                                //     style={styles.dialogBackButton}
                                //     onPress={(event) => {
                                //         event.stopPropagation();
                                //         goBackDialog();
                                //     }}
                                // >
                                //     <AppText style={styles.dialogBackButtonText}>
                                //         {lang === "ru" ? "назад" : "back"}
                                //     </AppText>
                                // </TouchableOpacity>
                                // arrow_back.svg
                                <TouchableOpacity
                                    style={styles.dialogBackButton}
                                    onPress={(event) => {
                                        event.stopPropagation();

                                        if (textPageIndex > 0) {
                                            setTextPageIndex((previous) =>
                                                Math.max(0, previous - 1)
                                            );
                                            return;
                                        }

                                        if (typeof line?.backLine === "number") {
                                            setTextPageIndex(0);
                                            goToLine(line.backLine);
                                            return;
                                        }

                                        goBackDialog();
                                    }}
                                >
                                    <MixedIcon
                                        activeOpacity={0.85}
                                        icon="arrow_back.svg"
                                        width={158 * SCALE}
                                        height={158 * SCALE}
                                        resizeMode="cover"
                                    />
                                </TouchableOpacity>

                            )}

                        {isLastTextPage &&
                            line?.logicChoice && (
                                <View
                                    pointerEvents="box-none"
                                    style={styles.logicChoiceButtonWrap}
                                >
                                    <TouchableOpacity
                                        activeOpacity={0.85}
                                        style={styles.logicChoiceButton}
                                        onPress={() => setLogicChoiceVisible(true)}
                                    >
                                        <AppText style={styles.logicChoiceButtonText}>
                                            {line.logicChoice.buttonText?.[lang] ||
                                                line.logicChoice.buttonText?.en ||
                                                (lang === "ru"
                                                    ? "Выбрать"
                                                    : "Choose")}
                                        </AppText>
                                    </TouchableOpacity>
                                </View>
                            )}

                        {line?.choiceResult?.type === "wrong" && (
                            <View
                                pointerEvents="none"
                                style={styles.choiceResultBadgeWrap}
                            >
                                <View style={styles.choiceResultBadgeWrong}>
                                    <AppText style={styles.choiceResultText}>
                                        {line.choiceResult.message?.[lang] ||
                                            line.choiceResult.message?.en ||
                                            ""}
                                    </AppText>
                                </View>
                            </View>
                        )}

                        {shouldShowHypothesis && currentHypothesis && (
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
                                                ? Math.min(screenWidth * 0.7, 520)
                                                : Math.min(screenWidth * 0.8, 390),
                                        },
                                    ]}
                                >
                                    {!!currentHypothesis.icon && (
                                        <View
                                            style={[
                                                styles.hypothesisResultImageWrap,
                                                {
                                                    width: isTabletScreen
                                                        ? Math.min(screenWidth * 0.42, 340)
                                                        : Math.min(screenWidth * 0.58, 300),

                                                    height: isTabletScreen
                                                        ? Math.min(screenHeight * 0.22, 360)
                                                        : Math.min(screenHeight * 0.27, 350),
                                                },
                                            ]}
                                        >
                                            <MixedIcon
                                                icon={currentHypothesis.icon}
                                                width={
                                                    isTabletScreen
                                                        ? Math.min(screenWidth * 0.42, 340)
                                                        : Math.min(screenWidth * 0.58, 300)
                                                }
                                                height={
                                                    isTabletScreen
                                                        ? Math.min(screenHeight * 0.22, 360)
                                                        : Math.min(screenHeight * 0.27, 350)
                                                }
                                                resizeMode="cover"
                                            />
                                        </View>
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

                        {isLastTextPage &&
                            line?.nextStepChoice && (
                                <View
                                    pointerEvents="box-none"
                                    style={styles.logicChoiceButtonWrap}
                                >
                                    <TouchableOpacity
                                        activeOpacity={0.85}
                                        style={styles.logicChoiceButton}
                                        onPress={(event) => {
                                            event.stopPropagation();
                                            setNextStepChoiceVisible(true);
                                        }}
                                    >
                                        <AppText
                                            style={styles.logicChoiceButtonText}
                                        >
                                            {line.nextStepChoice.buttonText?.[lang] ||
                                                line.nextStepChoice.buttonText?.en ||
                                                (lang === "ru"
                                                    ? "Выбрать"
                                                    : "Choose")}
                                        </AppText>
                                    </TouchableOpacity>
                                </View>
                            )
                        }

                        {isLastTextPage &&
                            line?.makeLogic && (
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
                                            {/*{!!item.icon && !!RESOURCES[item.icon] && (
                                                <Image
                                                    source={RESOURCES[item.icon]}
                                                    style={styles.logicSelectedIcon}
                                                />
                                            )}*/}
                                            {!!item.icon && (
                                                <View style={styles.logicSelectedIconWrap}>
                                                    <MixedIcon
                                                        icon={item.icon}
                                                        width={58}
                                                        height={58}
                                                        resizeMode="cover"
                                                    />
                                                </View>
                                            )}

                                            <AppText style={styles.logicSelectedText}>
                                                {item.short_description || item.name}
                                            </AppText>
                                        </View>
                                    ))}
                                </View>
                            )
                        }

                        {line?.choiceResult?.type === "correct" &&
                            line?.choiceResult?.showResultCard &&
                            line?.choiceResult?.resultCard && (
                                <View
                                    pointerEvents="none"
                                    style={styles.nextStepResultWrap}
                                >
                                    <View style={styles.nextStepResultCard}>
                                        {!!line.choiceResult.resultCard.icon && (
                                            <View
                                                style={
                                                    styles.nextStepResultImageWrap
                                                }
                                            >
                                                <MixedIcon
                                                    icon={
                                                        line.choiceResult
                                                            .resultCard.icon
                                                    }
                                                    width={width * 0.55}
                                                    height={height * 0.25}
                                                    resizeMode="cover"
                                                />
                                            </View>
                                        )}

                                        <View
                                            style={
                                                styles.nextStepResultTextBox
                                            }
                                        >
                                            <AppText
                                                style={
                                                    styles.nextStepResultText
                                                }
                                            >
                                                {line.choiceResult.resultCard
                                                        .text?.[lang] ||
                                                    line.choiceResult.resultCard
                                                        .text?.en ||
                                                    ""}
                                            </AppText>
                                        </View>
                                    </View>
                                </View>
                            )
                        }

                        {line?.choiceResult?.type === "correct" &&
                            line?.choiceResult?.showBadge && (
                                <View
                                    pointerEvents="none"
                                    style={styles.choiceResultBadgeWrap}
                                >
                                    <View
                                        style={
                                            styles.choiceResultBadgeCorrect
                                        }
                                    >
                                        <AppText
                                            style={styles.choiceResultText}
                                        >
                                            {line.choiceResult.message?.[
                                                    lang
                                                    ] ||
                                                line.choiceResult.message?.en ||
                                                ""}
                                        </AppText>
                                    </View>
                                </View>
                            )}

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
                                {/*{!!selectedProof.icon && !!RESOURCES[selectedProof.icon] && (
                                    <Image
                                        source={RESOURCES[selectedProof.icon]}
                                        style={styles.selectedProofIcon}
                                    />
                                )}*/}
                                {!!selectedProof.icon && (
                                    <View style={styles.selectedProofIconWrap}>
                                        <MixedIcon
                                            icon={selectedProof.icon}
                                            width={width * 0.44}
                                            height={width * 0.34}
                                            resizeMode="cover"
                                        />
                                    </View>
                                )}

                                <AppText style={styles.selectedProofText} numberOfLines={3}>
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

                        {/* overlays */}
                        {renderOverlays?.({ line, fadeToScene })}

                        {isLastTextPage && line?.nextStepChoice && (
                            <NextStepChoiceModal
                                visible={nextStepChoiceVisible}
                                lang={lang}
                                choice={line.nextStepChoice}
                                onClose={() =>
                                    setNextStepChoiceVisible(false)
                                }
                                onResult={({ option, correct }) => {
                                    setNextStepChoiceVisible(false);

                                    if (!correct) {
                                        loseHp(option.hpPenalty ?? 1);
                                    }

                                    if (option.resultLine) {
                                        goToDialogId(option.resultLine);
                                    }
                                }}
                            />
                        )}

                        {isLastTextPage &&
                            line?.logicChoice && (
                            <LogicChoiceModal
                                visible={logicChoiceVisible}
                                choice={line.logicChoice}
                                onClose={() =>
                                    setLogicChoiceVisible(false)
                                }
                                onResult={({ option, correct }) => {
                                    setLogicChoiceVisible(false);

                                    const hpPenalty = correct
                                        ? 0
                                        : option.hpPenalty ?? 1;

                                    if (hpPenalty > 0) {
                                        loseHp(hpPenalty);
                                    }

                                    console.log("🧠 LOGIC CHOICE:", {
                                        optionId: option.id,
                                        correct,
                                        hpPenalty,
                                        resultLine: option.resultLine,
                                    });

                                    if (option.resultLine) {
                                        goToDialogId(option.resultLine);
                                    }
                                }}
                            />
                        )}

                        {isLastTextPage &&
                            line?.showProof && (
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

                        {isLastTextPage &&
                            line?.makeLogic && (
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

                        {isLastTextPage &&
                            line?.showProof && (
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

                        {/* Самый верхний слой для анимаций */}
                        <View
                            pointerEvents="box-none"
                            style={styles.topAnimationLayer}
                        >
                            {activeFactAnimation && (
                                <ClueFlyAnimation
                                    text={activeFactAnimation.text}
                                    icon={activeFactAnimation.icon}
                                    category="facts"
                                    lang={lang}
                                    start={{
                                        x: width * 0.5,
                                        y: height * 0.25,
                                    }}
                                    end={{
                                        x: width * 0.68,
                                        y: height * 0.91,
                                    }}
                                    onFinish={handleFactAnimationFinish}
                                />
                            )}

                            {renderTopOverlays?.({
                                line,
                                fadeToScene,
                            })}

                            {isPrisonBarsEffect && (
                                <PrisonBarsAnimation
                                    key={`${currentScene}_${line?.id}`}
                                    startDelayMs={250}
                                    fallDurationMs={620}
                                    onFinished={() => {
                                        setPrisonBarsFinished(true);
                                    }}
                                />
                            )}
                        </View>
                    </ImageBackground>
                </Pressable>
            )}
        </SceneFade>
    );
}

const styles = StyleSheet.create({

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

    // selectedProofIcon: {
    //     width: width * 0.24,
    //     height: width * 0.24,
    //     resizeMode: "cover",
    //     borderRadius: 4,
    //     marginBottom: 6,
    // },
    selectedProofIconWrap: {
        width: width * 0.44,
        height: width * 0.34,

        borderRadius: 4,
        // marginBottom: 6,

        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
    },

    selectedProofText: {
        paddingTop: 14 * SCALE,
        color: "#FFFFFF",
        fontSize: 13 * 3 * SCALE,
        lineHeight: 17 * 3 * SCALE,
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

    // logicSelectedIcon: {
    //     width: 58,
    //     height: 58,
    //     resizeMode: "cover",
    //     borderRadius: 5,
    //     marginRight: 8,
    // },
    logicSelectedIconWrap: {
        width: 58,
        height: 58,

        borderRadius: 5,
        marginRight: 8,

        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
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

    // hypothesisResultImage: {
    //     resizeMode: "cover",
    //
    //     borderRadius: 6,
    //
    //     marginBottom: 12,
    // },
    hypothesisResultImageWrap: {
        borderRadius: 6,
        marginBottom: 12,

        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
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
    logicChoiceButtonWrap: {
        position: "absolute",

        left: 0,
        right: 0,

        bottom: height * 0.17,

        alignItems: "center",

        zIndex: 130,
        elevation: 130,
    },

    logicChoiceButton: {
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

    logicChoiceButtonText: {
        color: "#FFFFFF",

        fontSize: 14,

        fontFamily: "IBMPlexMono-Regular",
    },
    choiceResultBadgeWrap: {
        position: "absolute",

        left: 0,
        right: 0,

        bottom: height * 0.18,

        alignItems: "center",

        zIndex: 140,
        elevation: 140,
    },

    choiceResultBadgeWrong: {
        minWidth: width * 0.48,
        maxWidth: width * 0.82,

        backgroundColor: "#EA2118",

        borderRadius: 5,

        paddingHorizontal: 18,
        paddingVertical: 12,

        alignItems: "center",
        justifyContent: "center",
    },

    choiceResultText: {
        color: "#FFFFFF",

        fontSize: 15,
        lineHeight: 19,

        textAlign: "center",

        fontFamily: "IBMPlexMono-Bold",
    },
    hotspotButtonTouch: {
        position: "absolute",

        borderRadius: 7,

        overflow: "hidden",

        zIndex: 500,
        elevation: 500,

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    hotspot: {
        position: "absolute",
    },

    hotspotButtonInner: {
        position: "absolute",

        top: 2,
        left: 2,
        right: 2,
        bottom: 2,

        backgroundColor: "rgba(41, 79, 75, 0.97)",

        borderColor: "white",
        borderWidth: 2 * SCALE,

        borderRadius: 5,

        // paddingHorizontal: 10,
        // paddingVertical: 8,

        alignItems: "center",
        justifyContent: "center",

        zIndex: 2,
        elevation: 2,
    },

    hotspotButtonText: {
        color: "#FFFFFF",

        fontFamily: "IBMPlexMono-Regular",

        fontSize: 15 * 3 * SCALE,
        lineHeight: 23,

        textAlign: "center",

        zIndex: 3,
    },
    dialogBackButton: {
        position: "absolute",

        left: width * 0.06,
        top: height * 0.057,

        // backgroundColor: "rgba(41, 79, 75, 0.95)",

        // borderWidth: 2,
        // borderColor: "#E9DEC1",

        // borderRadius: 6,

        // paddingHorizontal: 16,
        // paddingVertical: 9,

        zIndex: 180,
        elevation: 180,
    },

    topAnimationLayer: {
        ...StyleSheet.absoluteFill,

        zIndex: 999999,
        elevation: 999999,

        overflow: "visible",
    },

    nextStepResultWrap: {
        position: "absolute",

        top: height * 0.07,
        left: 0,
        right: 0,

        alignItems: "center",

        zIndex: 145,
        elevation: 145,
    },

    nextStepResultCard: {
        width: width * 0.82,

        backgroundColor: "rgba(48, 82, 78, 0.98)",

        borderWidth: 2,
        borderColor: "#E9DEC1",

        borderRadius: 7,

        padding: 10,

        alignItems: "center",
    },

    nextStepResultImageWrap: {
        width: width * 0.55,
        height: height * 0.25,

        borderRadius: 6,
        overflow: "hidden",

        alignItems: "center",
        justifyContent: "center",

        marginBottom: 10,
    },

    nextStepResultTextBox: {
        width: "100%",

        minHeight: 48,

        backgroundColor: "#F7F2E7",

        borderRadius: 5,

        paddingHorizontal: 10,
        paddingVertical: 8,

        justifyContent: "center",
    },

    nextStepResultText: {
        color: "#4A5655",

        fontFamily: "IBMPlexMono-Regular",

        fontSize: 12 * 3 * SCALE,
        lineHeight: 16 * 3 * SCALE,

        textAlign: "center",
    },
    choiceResultBadgeCorrect: {
        minWidth: width * 0.42,
        maxWidth: width * 0.78,

        backgroundColor: "rgba(41, 79, 75, 0.97)",

        borderWidth: 2,
        borderColor: "#E9DEC1",

        borderRadius: 5,

        paddingHorizontal: 18,
        paddingVertical: 12,

        alignItems: "center",
        justifyContent: "center",
    },

    hotspotsLayer: {
        ...StyleSheet.absoluteFill,

        // zIndex: 30,
        // elevation: 30,

        overflow: "visible",
    },
    // ***IMPORTANT***
    charactersLayer: {
        ...StyleSheet.absoluteFill,

        // zIndex: 60,
        // elevation: 60,

        overflow: "visible",
    },

    hotspotIcon: {
        width: "100%",
        height: "100%",
        resizeMode: "contain",
    },
    // ***/IMPORTANT***
});