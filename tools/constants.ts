// --- ЭКРАН ---
import {Dimensions} from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// --- ИСХОДНЫЙ РАЗМЕР БЛОКНОТА (подставь реальные пропорции PNG) ---
// const DESIGN_WIDTH = 1240;
export const DESIGN_WIDTH = 1240;
export const DESIGN_HEIGHT = 1754;

// Масштаб так, чтобы блокнот влез по ширине и по высоте, + небольшой отступ (0.95)
export const SCALE = Math.min(
    (SCREEN_WIDTH * 0.99) / DESIGN_WIDTH,
    (SCREEN_HEIGHT * 0.99) / DESIGN_HEIGHT
);

// Реальные размеры блокнота на этом устройстве
export const NOTEBOOK_WIDTH = DESIGN_WIDTH * SCALE;
export const NOTEBOOK_HEIGHT = DESIGN_HEIGHT * SCALE;