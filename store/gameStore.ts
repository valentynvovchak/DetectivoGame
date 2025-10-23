import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {router} from "expo-router";

interface GameState {
    currentScene: string;
    currentLine: number;
    lang: "ru" | "en";
    volume: number;
    languages: string[];

    setScene: (scene: string) => void;
    nextLine: () => void;
    setLang: (lang: "ru" | "en") => void;
    setVolume: (v: number) => void;
    saveProgress: () => Promise<void>;
    loadProgress: () => Promise<void>;
    resetProgress: () => Promise<void>;
}

export const useGameStore = create<GameState>((set, get) => ({
    currentScene: "street_intro",
    currentLine: 0,
    lang: "en",
    volume: 0.5,
    languages: ["en", "ru"],

    // ✅ сохраняем прогресс ТОЛЬКО при переходе в новую сцену
    // setScene: (scene) => {
    //     set({ currentScene: scene, currentLine: 0 });
    //     get().saveProgress(); // сохраняем только сцену и начальную строку
    // },
    setScene: (scene) => {
        set({ currentScene: scene, currentLine: 0 });
        get().saveProgress();
        try {
            router.push(`/${scene}`); // переход на экран этой сцены
        } catch (e) {
            console.warn("⚠️ Ошибка навигации:", e);
        }
    },

    // ❌ при перелистывании диалогов ничего не сохраняем
    nextLine: () => {
        set((s) => ({ currentLine: s.currentLine + 1 }));
    },

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
            const { currentScene, lang, volume } = get();
            const data = { currentScene, currentLine: 0, lang, volume }; // line всегда 0
            await AsyncStorage.setItem("detective_di_save", JSON.stringify(data));
            console.log("✅ Прогресс сохранён:", data);
        } catch (e) {
            console.warn("❌ Ошибка сохранения", e);
        }
    },

    loadProgress: async () => {
        try {
            const data = await AsyncStorage.getItem("detective_di_save");
            if (data) {
                const parsed = JSON.parse(data);
                set({ ...parsed, currentLine: 0 }); // всегда начинаем с начала сцены
                console.log("🔄 Прогресс загружен:", parsed);
            }
        } catch (e) {
            console.warn("❌ Ошибка загрузки", e);
        }
    },

    resetProgress: async () => {
        await AsyncStorage.removeItem("detective_di_save");
        set({ currentScene: "street_intro", currentLine: 0 });
        console.log("🔁 Прогресс сброшен");
    },
}));