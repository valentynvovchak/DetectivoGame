import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {router} from "expo-router";
import {Animated} from "react-native";
import {setMusicVolume} from "@/components/audio/audioManager";

const dataDefault = {
    facts: [],
    dossier: [],
    evidence: [],
    hypotheses: []
}

const mapLocationsDefault = {
    "5_hospital": {
        name: {
            ru: "Городская клиника",
            en: "City Hospital",
        },
        unlocked: false,
        visited: false,
        // x: 0.68,
        // y: 0.80,
        x: 0.55,
        y: 0.61,
        icon: "map_hospital.png",
        targetScene: "5_hospital",
    },
    "6_laboratory": {
        name: {
            ru: "Полицейский участок",
            en: "Police",
        },
        unlocked: false,
        visited: false,
        x: 0.28,
        y: 0.77,
        icon: "map_laboratory.png",
        // по умолчанию первый визит
        targetScene: "6_laboratory",
    },
    "7_kanagawa_house": {
        name: {
            ru: "Дом Канагава",
            en: "Kanagawa House",
        },
        unlocked: false,
        visited: false,
        x: 0.75,
        y: 0.3,
        icon: "map_kanagawa_house.png",
        targetScene: "7_kanagawa_house",
    },
    // "8_kanagawa_house": {
    //     name: {
    //         ru: "Дом Канагава",
    //         en: "Kanagawa House",
    //     },
    //     unlocked: false,
    //     visited: false,
    //     x: 0.78,
    //     y: 0.23,
    //     icon: "map_kanagawa_house.png",
    // },

};

const getFreshDataDefault = () => ({
    facts: [],
    dossier: [],
    evidence: [],
    hypotheses: [],
});

const getMapProgress = (mapLocations: any) => {
    return Object.fromEntries(
        Object.entries(mapLocations).map(([id, loc]: any) => [
            id,
            {
                unlocked: !!loc.unlocked,
                visited: !!loc.visited,
            },
        ])
    );
};

const mergeMapProgressWithDefaults = (savedMapProgress: any = {}) => {
    return Object.fromEntries(
        Object.entries(mapLocationsDefault).map(([id, defaultLocation]: any) => {
            const savedLocation = savedMapProgress?.[id];

            return [
                id,
                {
                    ...defaultLocation,

                    // берем только состояние прохождения
                    unlocked:
                        typeof savedLocation?.unlocked === "boolean"
                            ? savedLocation.unlocked
                            : defaultLocation.unlocked,

                    visited:
                        typeof savedLocation?.visited === "boolean"
                            ? savedLocation.visited
                            : defaultLocation.visited,
                },
            ];
        })
    );
};

type UiNoticeSource = "tasks" | "briefcase";

type UiNoticeKind =
    | "new_task"
    | "task_completed"
    | "new_fact"
    | "new_dossier"
    | "new_evidence"
    | "new_hypothesis";

type UiNotice = {
    id: number;
    source: UiNoticeSource;
    kind: UiNoticeKind;
};

export interface GameState {
    currentScene: string;
    previousScene: string | null;
    currentLine: number;
    lang: "ru" | "en";
    volume: number;
    languages: string[];
    data: object;
    sceneBackground: string | null;
    sceneResizeMode: "cover" | "contain";
    activeTasks: string[];
    completedTasks: string[];
    unseenTaskActionsCount: number;
    uiNotices: UiNotice[];
    hasSave: boolean;
    isHydrated: boolean;
    mapNotification: {
        id: string;
        text: {
            ru: string;
            en: string;
        };
        locationId?: string;
    } | null;

    setScene: (scene: string) => void;
    fadeAnim: Animated.Value;
    nextLine: () => void;
    goToLine: (id) => void;
    changeScene: (scene: string, line?: number) => Promise<void>;
    goBackFromMap: () => void;
    setLang: (lang: "ru" | "en") => void;
    setVolume: (v: number) => void;
    saveProgress: () => Promise<void>;
    loadProgress: () => Promise<void>;
    resetProgress: () => Promise<void>;
    hasItem: (type: keyof typeof dataDefault, id: string) => boolean
    addToData: (type: string, id: string) => void;
    getItemData: (type: string, id: string) => object;
    hasNewItems: boolean,
    markNewItems: () => void,
    clearNewItems: () => void,
    mapLocations: object;
    unlockLocation: (id: string) => void;
    visitLocation: (id: string) => void;
    reopenLocation: (
        id: string,
        targetScene?: string
    ) => void;
    isLocationUnlocked: (id: string) => boolean;
    isLocationVisited: (id: string) => boolean;
    setSceneBackground: (bg: string, mode?: "cover" | "contain") => void;
    addTask: (id: string) => void;
    completeTask: (id: string) => void;
    removeTask: (id: string) => void;
    isTaskActive: (id: string) => boolean;
    isTaskCompleted: (id: string) => boolean;
    clearTaskActionsCounter: () => void;
    pushUiNotice: (notice: {
        source: UiNoticeSource;
        kind: UiNoticeKind;
    }) => void;
    removeUiNotice: (id: number) => void;
    checkHasSave: () => Promise<boolean>;
    setHasSave: (value: boolean) => void;
    setMapNotification: (
        notification: {
            id: string;

            text: {
                ru: string;
                en: string;
            };

            locationId?: string;
        } | null
    ) => void;
    setLocationTarget: (id: string, scene: string) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
    currentScene: "2_street_intro",
    previousScene: null,
    currentLine: 0,
    lang: "en",
    volume: 0.2,
    languages: ["en", "ru"],
    fadeAnim: new Animated.Value(0),
    hasNewItems: false,
    data: getFreshDataDefault(),
    mapLocations: mergeMapProgressWithDefaults(),
    sceneBackground: null,
    sceneResizeMode: "cover",
    activeTasks: [],
    completedTasks: [],
    unseenTaskActionsCount: 0,
    uiNotices: [],
    hasSave: false,
    isHydrated: false,
    mapNotification: null,

    // ✅ сохраняем прогресс ТОЛЬКО при переходе в новую сцену
    setScene: async (scene) => {
        set({ currentScene: scene, currentLine: 0 });
        await get().saveProgress(); // сохраняем только сцену и начальную строку
    },

    changeScene: async (scene, line = 0) => {
        const { currentScene } = get();

        set({
            previousScene: currentScene,
            currentScene: scene,
            currentLine: line,
            sceneBackground: null,
            sceneResizeMode: "cover",
        });

        router.replace(`/${scene}`);
    },


    goBackFromMap: () => {
        const { previousScene } = get();
        router.replace(previousScene ? `/${previousScene}` : '/');
    },

    // ❌ при перелистывании диалогов ничего не сохраняем
    nextLine: () => {
        set((s) => ({ currentLine: s.currentLine + 1 }));
        // get().saveProgress?.();
    },

    goToLine: (id) => {
        set(() => ({ currentLine: Math.max(id - 1, 0) }));
        // get().saveProgress?.();
    },

    setLang: async (lang) => {
        set({ lang });
        await get().saveProgress();
    },

    setVolume: async (v) => {
        set({ volume: v });
        await setMusicVolume(v);
        await get().saveProgress();
    },

    saveProgress: async () => {
        try {
            const {
                currentScene,
                previousScene,
                currentLine,
                lang,
                volume,
                data,
                mapLocations,
                activeTasks,
                completedTasks,
                unseenTaskActionsCount,
                sceneBackground,
                sceneResizeMode,
            } = get();

            const savingData = {
                currentScene,
                previousScene,
                currentLine,
                lang,
                volume,
                data,
                // важно: сохраняем не всю карту, а только visited/unlocked
                mapProgress: getMapProgress(mapLocations),
                activeTasks,
                completedTasks,
                unseenTaskActionsCount,
                sceneBackground,
                sceneResizeMode,
            };

            await AsyncStorage.setItem(
                "detective_di_save",
                JSON.stringify(savingData)
            );

            set({ hasSave: true });

            console.log("✅ Прогресс сохранён:", savingData);
        } catch (e) {
            console.warn("❌ Ошибка сохранения", e);
        }
    },

    loadProgress: async () => {
        try {
            const loadingData = await AsyncStorage.getItem("detective_di_save");

            if (!loadingData) {
                set({
                    hasSave: false,
                    isHydrated: true,
                });

                return;
            }

            const parsed = JSON.parse(loadingData);

            const loadedScene = parsed.currentScene || "2_street_intro";

            set({
                currentScene: loadedScene,
                previousScene: parsed.previousScene ?? null,

                currentLine:
                    typeof parsed.currentLine === "number"
                        ? parsed.currentLine
                        : 0,

                lang: parsed.lang ?? "en",
                volume: parsed.volume ?? 0.2,

                data: {
                    ...getFreshDataDefault(),
                    ...(parsed.data ?? {}),
                },

                mapLocations: mergeMapProgressWithDefaults(
                    parsed.mapProgress ?? parsed.mapLocations
                ),

                activeTasks: parsed.activeTasks ?? [],
                completedTasks: parsed.completedTasks ?? [],
                unseenTaskActionsCount: parsed.unseenTaskActionsCount ?? 0,

                sceneBackground: parsed.sceneBackground ?? null,
                sceneResizeMode: parsed.sceneResizeMode ?? "cover",

                uiNotices: [],
                hasSave: true,
                isHydrated: true,
            });

            console.log("🔄 Прогресс загружен:", parsed);
        } catch (e) {
            console.warn("❌ Ошибка загрузки", e);

            set({
                hasSave: false,
                isHydrated: true,
            });
        }
    },

    resetProgress: async () => {
        await AsyncStorage.removeItem("detective_di_save");

        set({
            currentScene: "2_street_intro",
            previousScene: null,
            currentLine: 0,
            data: getFreshDataDefault(),
            mapLocations: mergeMapProgressWithDefaults(),
            activeTasks: [],
            completedTasks: [],
            unseenTaskActionsCount: 0,
            uiNotices: [],
            sceneBackground: null,
            sceneResizeMode: "cover",
            hasSave: false,
            isHydrated: true,
        });

        console.log("🔁 Прогресс сброшен");
    },

    hasItem: (type, id) => {
        const state = get();
        const arr = state.data[type] || [];
        return Array.isArray(arr) && arr.includes(id);
    },

    addToData: (type, id) => {
        const s = get();
        const list = s.data[type];

        if (!Array.isArray(list)) {
            console.warn(`❌ Неизвестный тип data: ${type}`);
            return;
        }

        if (list.includes(id)) {
            console.log(`⚠️ ${id} уже есть в ${type}`);
            return;
        }

        set({
            data: {
                ...s.data,
                [type]: [id, ...list],
            },
            hasNewItems: true,
        });

        const noticeByType: Record<string, UiNoticeKind> = {
            facts: "new_fact",
            dossier: "new_dossier",
            evidence: "new_evidence",
            hypotheses: "new_hypothesis",
        };

        const noticeKind = noticeByType[type];

        if (noticeKind) {
            get().pushUiNotice({
                source: "briefcase",
                kind: noticeKind,
            });
        }

        // get().saveProgress?.();

        console.log(`✅ Добавлено: ${id} в ${type}`);
    },

    // Хелпер для получения полного объекта
    getItemData: (type, id) => {
        switch (type) {
            case "facts": return get().data.facts[id];
            case "dossier": return get().data.dossier[id];
            case "evidence": return get().data.evidence[id];
            case "hypotheses": return get().data.hypotheses[id];
            default: return null;
        }
    },
    markNewItems: () => set({ hasNewItems: true }),
    clearNewItems: () => set({ hasNewItems: false }),

    unlockLocation: (id) => {
        const s = get();

        if (!s.mapLocations[id]) {
            console.warn("Unknown location:", id);
            return;
        }

        set({
            mapLocations: {
                ...s.mapLocations,
                [id]: {
                    ...s.mapLocations[id],
                    unlocked: true,
                },
            },
        });

        // get().saveProgress?.();
    },

    visitLocation: async (id) => {
        const s = get();

        if (!s.mapLocations[id]) {
            console.warn("Unknown location:", id);
            return;
        }

        set({
            mapLocations: {
                ...s.mapLocations,
                [id]: {
                    ...s.mapLocations[id],
                    visited: true,
                },
            },
        });

        // await get().saveProgress?.();
    },

    reopenLocation: (id, targetScene) => {
        const s = get();

        const location = s.mapLocations[id];

        if (!location) {
            console.warn("Unknown location:", id);
            return;
        }

        set({
            mapLocations: {
                ...s.mapLocations,

                [id]: {
                    ...location,

                    unlocked: true,
                    visited: false,

                    ...(targetScene
                        ? { targetScene }
                        : {}),
                },
            },
        });

        console.log("🗺️ Location reopened:", {
            id,
            targetScene,
        });
    },

    isLocationUnlocked: (id) => {
        return !!get().mapLocations[id]?.unlocked;
    },

    isLocationVisited: (id) => {
        return !!get().mapLocations[id]?.visited;
    },

    setSceneBackground: (bg, mode = "cover") => {
        set({
            sceneBackground: bg,
            sceneResizeMode: mode,
        });
    },

    addTask: (id) => {
        const state = get();

        if (
            state.activeTasks.includes(id) ||
            state.completedTasks.includes(id)
        ) {
            return;
        }

        set({
            activeTasks: [...state.activeTasks, id],
            unseenTaskActionsCount: state.unseenTaskActionsCount + 1,
        });

        get().pushUiNotice({
            source: "tasks",
            kind: "new_task",
        });

        // get().saveProgress?.();
    },

    completeTask: (id) => {
        const state = get();

        if (!state.activeTasks.includes(id)) {
            return;
        }

        set({
            activeTasks: state.activeTasks.filter((taskId) => taskId !== id),
            completedTasks: state.completedTasks.includes(id)
                ? state.completedTasks
                : [...state.completedTasks, id],
            unseenTaskActionsCount: state.unseenTaskActionsCount + 1,
        });

        get().pushUiNotice({
            source: "tasks",
            kind: "task_completed",
        });

        // get().saveProgress?.();
    },

    removeTask: (id) => {
        const state = get();

        const wasActive = state.activeTasks.includes(id);
        const wasCompleted = state.completedTasks.includes(id);

        if (!wasActive && !wasCompleted) {
            return;
        }

        set({
            activeTasks: state.activeTasks.filter((taskId) => taskId !== id),
            completedTasks: state.completedTasks.filter((taskId) => taskId !== id),
            unseenTaskActionsCount: state.unseenTaskActionsCount + 1,
        });

        // get().saveProgress?.();
    },

    clearTaskActionsCounter: () => {
        set({
            unseenTaskActionsCount: 0,
        });

        // get().saveProgress?.();
    },

    isTaskActive: (id) => {
        return get().activeTasks.includes(id);
    },

    isTaskCompleted: (id) => {
        return get().completedTasks.includes(id);
    },

    pushUiNotice: (notice) => {
        const noticeId = Date.now() + Math.random();

        set((state) => ({
            uiNotices: [
                ...state.uiNotices,
                {
                    id: noticeId,
                    source: notice.source,
                    kind: notice.kind,
                },
            ],
        }));
    },

    removeUiNotice: (id) => {
        set((state) => ({
            uiNotices: state.uiNotices.filter((notice) => notice.id !== id),
        }));
    },

    checkHasSave: async () => {
        try {
            const saved = await AsyncStorage.getItem("detective_di_save");
            const exists = !!saved;

            set({ hasSave: exists });

            return exists;
        } catch (e) {
            console.warn("❌ Ошибка проверки сохранения", e);
            set({ hasSave: false });
            return false;
        }
    },

    setHasSave: (value) => {
        set({ hasSave: value });
    },

    setMapNotification: (notification) => {
        set({
            mapNotification: notification,
        });
    },

    setLocationTarget: (id, scene) => {
        const s = get();

        if (!s.mapLocations[id]) {
            console.warn("Unknown location:", id);
            return;
        }

        set({
            mapLocations: {
                ...s.mapLocations,
                [id]: {
                    ...s.mapLocations[id],
                    targetScene: scene,
                },
            },
        });
    },

}));