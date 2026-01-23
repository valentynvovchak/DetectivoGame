import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {router} from "expo-router";
import {Animated} from "react-native";
import {setMusicVolume} from "@/components/audio/audioManager";
import dialogs from "@/data/dialogs.json";

const dataDefault = {
    facts: [],
    dossier: [],
    evidence: [],
    hypotheses: []
}

const mapLocationsDefault = {
    '5_hospital': {
        name: {
            ru: "Городская клиника",
                en: "City Hospital",
        },
        unlocked: false,
            visited: false,
            x: 0.67,
            y: 0.80,
    },
    '6_police': {
        name: {
            ru: "Полицейский участок",
                en: "Police Station",
        },
        unlocked: false,
            visited: false,
            x: 0.4,
            y: 0.6,
    },
}

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

    setScene: (scene: string) => void;
    fadeAnim: Animated.Value;
    nextLine: () => void;
    goToLine: (id) => void;
    changeScene: (scene: string) => Promise<void>;
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
    isLocationUnlocked: (id: string) => boolean;
    isLocationVisited: (id: string) => boolean;

    setSceneBackground: (bg: string, mode?: "cover" | "contain") => void;
}

export const useGameStore = create<GameState>((set, get) => ({
    currentScene: "2_street_intro",
    previousScene: null,
    currentLine: 0,
    lang: "en",
    volume: 0.5,
    languages: ["en", "ru"],
    fadeAnim: new Animated.Value(0),
    hasNewItems: false,
    data: dataDefault,
    sceneBackground: null,
    sceneResizeMode: "cover",

    mapLocations: mapLocationsDefault,

    // ✅ сохраняем прогресс ТОЛЬКО при переходе в новую сцену
    setScene: async (scene) => {
        set({ currentScene: scene, currentLine: 0 });
        await get().saveProgress(); // сохраняем только сцену и начальную строку
    },

    /*setScene: (scene) => {
        set({ currentScene: scene, currentLine: 0 });
        get().saveProgress();
        try {
            router.push(`/${scene}`); // переход на экран этой сцены
        } catch (e) {
            console.warn("⚠️ Ошибка навигации:", e);
        }
    },*/
    /*changeScene: async (scene) => {
        set({ currentScene: scene, currentLine: 0 });
        await get().saveProgress();
        try {
            router.push(`/${scene}`);
        } catch (e) {
            console.warn("⚠️ Ошибка навигации:", e);
        }
    },*/

    /*changeScene: async (scene, line=0) => {
        const { currentScene } = get();
        set({
            previousScene: currentScene,
            currentScene: scene,
            currentLine: line,
        });

        await get().saveProgress();
        router.push(`/${scene}`);
    },*/
    changeScene: async (scene, line = 0) => {
        const { currentScene } = get();
        const sceneData = dialogs[scene];

        set({
            previousScene: currentScene,
            currentScene: scene,
            currentLine: line,
            sceneBackground: sceneData?.background || null,
            sceneResizeMode: "cover",
        });

        await get().saveProgress();
        router.push(`/${scene}`);
    },


    goBackFromMap: () => {
        const { previousScene } = get();
        router.push(previousScene ? `/${previousScene}` : '/');
    },

    // ❌ при перелистывании диалогов ничего не сохраняем
    nextLine: () => {
        set((s) => ({ currentLine: s.currentLine + 1 }));
    },

    goToLine: (id) => {
        set(() => ({ currentLine: id-1 }));
    },

    /*changeScene: async (scene) => {
        const fadeAnim = get().fadeAnim;

        // 1️⃣ затемнение
        await new Promise((resolve) => {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: false,
            }).start(() => resolve(true));
        });

        // 2️⃣ смена сцены
        set({ currentScene: scene, currentLine: 0 });
        get().saveProgress();

        try {
            router.push(`/${scene}`); // переход на экран этой сцены
        } catch (e) {
            console.warn("⚠️ Ошибка навигации:", e);
        }

        // 3️⃣ плавное проявление
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: false,
        }).start();
    },*/

    setLang: async (lang) => {
        set({ lang });
        await get().saveProgress();
    },

    setVolume: async (v) => {
        set({ volume: v });
        await setMusicVolume(v); // 🔥 МГНОВЕННО влияет на музыку
        await get().saveProgress();
    },

    saveProgress: async () => {
        try {
            const { currentScene, lang, volume, data, mapLocations } = get();
            const savingData = { currentScene, currentLine: 0, lang, volume, data, mapLocations }; // line всегда 0
            await AsyncStorage.setItem("detective_di_save", JSON.stringify(savingData));
            console.log("✅ Прогресс сохранён:", savingData);
        } catch (e) {
            console.warn("❌ Ошибка сохранения", e);
        }
    },

    loadProgress: async () => {
        try {
            const loadingData = await AsyncStorage.getItem("detective_di_save");
            if (loadingData) {
                const parsed = JSON.parse(loadingData);
                set({ ...parsed, currentLine: 0 }); // всегда начинаем с начала сцены TODO: возможны баги с айтемами например
                console.log("🔄 Прогресс загружен:", parsed);
            }
        } catch (e) {
            console.warn("❌ Ошибка загрузки", e);
        }
    },

    resetProgress: async () => {
        await AsyncStorage.removeItem("detective_di_save");
        set({ currentScene: "2_street_intro", currentLine: 0, data: dataDefault, mapLocations: mapLocationsDefault });
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
        if (list.includes(id)) {
            console.log(`⚠️ ${id} уже есть в ${type}`);
            return;
        }
        set({
            data: {
                ...s.data,
                [type]: [...list, id]
            },
            hasNewItems: true // 🔴 появляется индикатор
        });
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
        if (!s.mapLocations[id]) return;

        set({
            mapLocations: {
                ...s.mapLocations,
                [id]: {
                    ...s.mapLocations[id],
                    unlocked: true,
                },
            },
        });
    },

    visitLocation: async (id) => {
        const s = get();
        if (!s.mapLocations[id]) return;
        await set({
            mapLocations: {
                ...s.mapLocations,
                [id]: {
                    ...s.mapLocations[id],
                    visited: true,
                },
            },
        });
        // await get().changeScene(id); // ✅ правильно
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

}));