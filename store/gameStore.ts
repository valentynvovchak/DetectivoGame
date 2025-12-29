import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {router} from "expo-router";
import {Animated} from "react-native";

const dataDefault = {
    facts: [],
    dossier: [],
    evidence: [],
    hypotheses: []
}

interface GameState {
    currentScene: string;
    currentLine: number;
    lang: "ru" | "en";
    volume: number;
    languages: string[];

    data: object;

    setScene: (scene: string) => void;
    fadeAnim: Animated.Value;
    nextLine: () => void;
    changeScene: (scene: string) => Promise<void>;
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
}

export const useGameStore = create<GameState>((set, get) => ({
    currentScene: "street_intro",
    currentLine: 0,
    lang: "en",
    volume: 0.5,
    languages: ["en", "ru"],
    fadeAnim: new Animated.Value(0),
    hasNewItems: false,

    data: dataDefault,

    // ✅ сохраняем прогресс ТОЛЬКО при переходе в новую сцену
    setScene: (scene) => {
        set({ currentScene: scene, currentLine: 0 });
        get().saveProgress(); // сохраняем только сцену и начальную строку
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
    changeScene: async (scene) => {
        set({ currentScene: scene, currentLine: 0 });
        get().saveProgress();
        try {
            router.push(`/${scene}`);
        } catch (e) {
            console.warn("⚠️ Ошибка навигации:", e);
        }
    },

    // ❌ при перелистывании диалогов ничего не сохраняем
    nextLine: () => {
        set((s) => ({ currentLine: s.currentLine + 1 }));
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

    setLang: (lang) => {
        set({ lang });
        get().saveProgress();
    },

    setVolume: (v) => {
        set({ volume: v });
        get().saveProgress();
    },

    saveProgress: async () => {
        try {
            const { currentScene, lang, volume, data } = get();
            const savingData = { currentScene, currentLine: 0, lang, volume, data }; // line всегда 0
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
        set({ currentScene: "street_intro", currentLine: 0, data: dataDefault });
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

}));