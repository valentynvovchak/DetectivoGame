import React, { useCallback, useEffect, useState } from "react";
import { LayoutChangeEvent, StyleSheet, View } from "react-native";
import type { SvgProps } from "react-native-svg";
import { getSprite } from "@/tools/utils";

type Side = "left" | "right" | "center";
type CharacterMode = "full" | "cut" | "zoom" | "zoom2" | "zoom3" | "bottom";
type CharacterId = "daniel" | "di" | "mai" | "kanagawa" | "roberts" |
    "housekeeper" | "sister" | "lawyer" | "colleague" | "judge";

type Tuning = {
    /** 1 = исходный размер. 1.1 = на 10% больше. Точка между глазами не сдвигается. */
    size?: number;
    /** Единицы макета 390 × 844. Плюс: вправо / вниз, минус: влево / вверх. */
    offsetX?: number;
    offsetY?: number;
};

type SpriteConfig = Tuning & {
    character: CharacterId;
    /** Ширина и высота viewBox SVG. Не меняем для регулировки размера! */
    width: number;
    height: number;
    /** Точка между глазами, в долях ПОЛНОГО файла: 0..1, включая прозрачные поля. */
    eyeX: number;
    eyeY: number;
    /** От макушки до подбородка / высота файла. Не длина волос и не высота тела. */
    headHeight: number;
};

const DESIGN_WIDTH = 390;
const DESIGN_HEIGHT = 844;

/** Включить для настройки: рамка SVG и красная точка между глазами. */
const DEBUG_CHARACTER_LAYOUT = false;

/**
 * 1. КРУПНОСТЬ ПЛАНА. Все расстояния — в единицах макета 390 × 844.
 * height — высота эталонного спрайта, bottom — его отступ снизу.
 * Обрезанные позы НЕ растягиваются до этой высоты: масштаб считаем по голове.
 * Смена mode намеренно меняет план; смена только sprite сохраняет точку лица.
 */
export const MODE_CONFIG: Record<CharacterMode, {
    height: number; bottom: number; sideOffset: number;
}> = {
    full:   { height: 600, bottom: 0,    sideOffset: -18 },
    cut:    { height: 690, bottom: -55,  sideOffset: -24 },
    zoom:   { height: 760, bottom: -90,  sideOffset: -30 },
    zoom2:  { height: 720, bottom: -75,  sideOffset: -26 },
    zoom3:  { height: 780, bottom: -100, sideOffset: -30 },
    bottom: { height: 620, bottom: -220, sideOffset: -20 },
};

/**
 * 2. НАСТРОЙКИ ПЕРСОНАЖА: применяются ко ВСЕМ его позам.
 * reference — основной спрайт, по которому выставлены исходный размер и позиция.
 * Например, daniel.size = 1.1 увеличит все позы Даниэля, не сдвигая глаза.
 * offsetY = 20 опустит все позы на 20 единиц макета; -20 поднимет.
 */
export const CHARACTER_CONFIG: Record<CharacterId, Tuning & { reference: string }> = {
    daniel:      { reference: "daniel_serious",       size: 1, offsetX: 0, offsetY: 0 },
    di:          { reference: "di_serious",           size: 1, offsetX: 0, offsetY: 0 },
    mai:         { reference: "mai_found_the_car",     size: 1, offsetX: 0, offsetY: 0 },
    kanagawa:    { reference: "mr_kanagava_serious",   size: 1, offsetX: 0, offsetY: 0 },
    roberts:     { reference: "roberts",              size: 1, offsetX: 0, offsetY: 0 },
    housekeeper: { reference: "housekeeper",          size: 1, offsetX: 0, offsetY: 0 },
    sister:      { reference: "mrs_kanagawa_sister",  size: 1, offsetX: 0, offsetY: 0 },
    lawyer:      { reference: "lawyer",               size: 1, offsetX: 0, offsetY: 0 },
    colleague:   { reference: "colleague_thinking",   size: 1, offsetX: 0, offsetY: 0 },
    judge:       { reference: "judge",                size: 1, offsetX: 0, offsetY: 0 },
};

/**
 * 3. КАЛИБРОВКА ОТДЕЛЬНЫХ ПОЗ. SVG менять не нужно.
 * eyeX / eyeY / headHeight измерены по текущим рисункам, а не по краю ног.
 * Поэтому укороченный файл и прозрачные поля не меняют высоту лица.
 * Для точной подгонки конкретной позы добавляйте size, offsetX, offsetY:
 * judge_sad: { ...данные ниже..., size: 1.02, offsetY: -2 }
 * Размер головы и точка глаз — визуальная калибровка, её можно уточнять.
 * Новому спрайту нужна запись здесь и регистрация в tools/utils.ts.
 */
export const SPRITE_CONFIG: Record<string, SpriteConfig> = {
    daniel_smile:     { character: "daniel", width: 607, height: 1792, eyeX: 0.485, eyeY: 0.096, headHeight: 0.162 },
    daniel_serious:   { character: "daniel", width: 666, height: 1791, eyeX: 0.441, eyeY: 0.096, headHeight: 0.164 },
    daniel_thinking:  { character: "daniel", width: 574, height: 1792, eyeX: 0.469, eyeY: 0.096, headHeight: 0.160 },
    daniel_finger_up: { character: "daniel", width: 877, height: 1835, eyeX: 0.494, eyeY: 0.122, headHeight: 0.194 },
    daniel_shocked:   { character: "daniel", width: 698, height: 1474, eyeX: 0.397, eyeY: 0.126, headHeight: 0.202 },
    di_serious:  { character: "di", width: 545, height: 1636, eyeX: 0.485, eyeY: 0.116, headHeight: 0.176 },
    di_thinking: { character: "di", width: 520, height: 1658, eyeX: 0.446, eyeY: 0.114, headHeight: 0.178 },
    di_shocked:  { character: "di", width: 597, height: 1622, eyeX: 0.516, eyeY: 0.114, headHeight: 0.184 },
    di_ok:      { character: "di", width: 664, height: 1699, eyeX: 0.533, eyeY: 0.120, headHeight: 0.176 },
    mai_found_the_car: { character: "mai", width: 271, height: 685, eyeX: 0.470, eyeY: 0.108, headHeight: 0.176 },
    mr_kanagawa_crying:  { character: "kanagawa", width: 200, height: 525, eyeX: 0.495, eyeY: 0.128, headHeight: 0.220 },
    mr_kanagava_serious: { character: "kanagawa", width: 270, height: 737, eyeX: 0.486, eyeY: 0.136, headHeight: 0.236 },
    mr_kanagava_scared:  { character: "kanagawa", width: 257, height: 649, eyeX: 0.485, eyeY: 0.144, headHeight: 0.264 },
    mr_kanagava_thinking:{ character: "kanagawa", width: 306, height: 561, eyeX: 0.531, eyeY: 0.188, headHeight: 0.338 },
    roberts:                { character: "roberts", width: 225, height: 607, eyeX: 0.486, eyeY: 0.118, headHeight: 0.180 },
    roberts_yes:            { character: "roberts", width: 360, height: 719, eyeX: 0.540, eyeY: 0.124, headHeight: 0.236 },
    roberts_holding_a_ball: { character: "roberts", width: 335, height: 657, eyeX: 0.529, eyeY: 0.122, headHeight: 0.214 },
    housekeeper:         { character: "housekeeper", width: 304, height: 652, eyeX: 0.455, eyeY: 0.112, headHeight: 0.220 },
    housekeeper_worried: { character: "housekeeper", width: 276, height: 608, eyeX: 0.498, eyeY: 0.136, headHeight: 0.248 },
    mrs_kanagawa_sister:           { character: "sister", width: 276, height: 829, eyeX: 0.506, eyeY: 0.128, headHeight: 0.188 },
    mrs_kanagawa_sister_sad:       { character: "sister", width: 300, height: 929, eyeX: 0.484, eyeY: 0.110, headHeight: 0.202 },
    mrs_kanagawa_sister_angry:     { character: "sister", width: 325, height: 803, eyeX: 0.554, eyeY: 0.138, headHeight: 0.180 },
    mrs_kanagawa_sister_finger_up: { character: "sister", width: 381, height: 720, eyeX: 0.502, eyeY: 0.180, headHeight: 0.284 },
    lawyer:  { character: "lawyer", width: 300, height: 750, eyeX: 0.485, eyeY: 0.114, headHeight: 0.224 },
    lawyer2: { character: "lawyer", width: 273, height: 750, eyeX: 0.484, eyeY: 0.114, headHeight: 0.224 },
    colleague:          { character: "colleague", width: 250, height: 624, eyeX: 0.470, eyeY: 0.108, headHeight: 0.226 },
    colleague_thinking: { character: "colleague", width: 303, height: 763, eyeX: 0.487, eyeY: 0.124, headHeight: 0.224 },
    colleague_hand_up:  { character: "colleague", width: 298, height: 703, eyeX: 0.528, eyeY: 0.108, headHeight: 0.224 },
    colleague_shocked:  { character: "colleague", width: 252, height: 668, eyeX: 0.460, eyeY: 0.114, headHeight: 0.230 },
    judge:     { character: "judge", width: 870, height: 2139, eyeX: 0.527, eyeY: 0.108, headHeight: 0.152 },
    judge_sad: { character: "judge", width: 575, height: 1031, eyeX: 0.513, eyeY: 0.146, headHeight: 0.160 },
};

// Определяем профиль по уже переданному SVG-компоненту. DialogScene менять не нужно.
// mai_found_the_car_with_icon использует тот же компонент, что mai_found_the_car.
const spriteNames = new Map<React.ComponentType<SvgProps>, string>(
    Object.keys(SPRITE_CONFIG).map((name) => [getSprite(name), name])
);

interface CharacterSpriteProps {
    side: Side;
    Sprite: React.ComponentType<SvgProps>;
    mode?: CharacterMode;
    isSpeaking?: boolean;
    /** Дополнительный размер только для этой реплики. Масштаб вокруг глаз. */
    heightModifier?: number;
    /** Доля высоты сцены. Положительное значение опускает. */
    yModifier?: number;
    /** Доля ширины сцены. Положительное значение сдвигает вправо. */
    xModifier?: number;
    /** Совместимость с DialogScene. Результат проверки больше не меняет план сам. */
    proofResult?: unknown;
}

type LayoutInput = {
    spriteName: string;
    sceneWidth: number;
    sceneHeight: number;
    side: Side;
    mode?: CharacterMode;
    heightModifier?: number;
    xModifier?: number;
    yModifier?: number;
};

const positive = (value: number | undefined, fallback: number) =>
    typeof value === "number" && Number.isFinite(value) && value > 0 ? value : fallback;
const finite = (value: number | undefined) =>
    typeof value === "number" && Number.isFinite(value) ? value : 0;

/** Чистый расчёт: одна пропорция, одна точка привязки, никаких веток по устройствам. */
export function getCharacterLayout({
                                       spriteName, sceneWidth, sceneHeight, side, mode = "full",
                                       heightModifier = 1, xModifier = 0, yModifier = 0,
                                   }: LayoutInput) {
    const sprite = SPRITE_CONFIG[spriteName];
    if (!sprite || !Number.isFinite(sceneWidth) || !Number.isFinite(sceneHeight) ||
        sceneWidth <= 0 || sceneHeight <= 0) return null;

    const character = CHARACTER_CONFIG[sprite.character];
    const reference = SPRITE_CONFIG[character.reference];
    const shot = MODE_CONFIG[mode] ?? MODE_CONFIG.full;
    const scale = Math.min(sceneWidth / DESIGN_WIDTH, sceneHeight / DESIGN_HEIGHT);
    const referenceHeight = shot.height * scale;
    const size = positive(character.size, 1) * positive(sprite.size, 1) *
        positive(heightModifier, 1);

    // Одинаковая высота головы в разных позах, даже если у одной нет ног.
    const headHeight = referenceHeight * reference.headHeight * size;
    const height = headHeight / sprite.headHeight;
    const width = height * sprite.width / sprite.height;

    // Положение лица задаёт ЭТАЛОН. Текущая поза и размер не двигают эту точку.
    const referenceWidth = referenceHeight * reference.width / reference.height;
    const eyeX = (side === "left"
            ? shot.sideOffset * scale + referenceWidth * reference.eyeX
            : side === "right"
                ? sceneWidth - shot.sideOffset * scale - referenceWidth * (1 - reference.eyeX)
                : sceneWidth / 2) +
        (finite(character.offsetX) + finite(sprite.offsetX)) * scale +
        finite(xModifier) * sceneWidth;
    const eyeY = sceneHeight - shot.bottom * scale -
        referenceHeight * (1 - reference.eyeY) +
        (finite(character.offsetY) + finite(sprite.offsetY)) * scale +
        finite(yModifier) * sceneHeight;

    return {
        width, height, headHeight, eyeX, eyeY,
        left: eyeX - width * sprite.eyeX,
        top: eyeY - height * sprite.eyeY,
    };
}

export default function CharacterSpriteNew({
                                               side, Sprite, mode = "full", heightModifier = 1, yModifier = 0, xModifier = 0,
                                           }: CharacterSpriteProps) {
    const [sceneSize, setSceneSize] = useState({ width: 0, height: 0 });
    const onLayout = useCallback(({ nativeEvent: { layout } }: LayoutChangeEvent) => {
        setSceneSize((previous) => previous.width === layout.width && previous.height === layout.height
            ? previous : { width: layout.width, height: layout.height });
    }, []);
    const spriteName = spriteNames.get(Sprite);
    useEffect(() => {
        if (__DEV__ && !spriteName) {
            console.warn("CharacterSpriteNew: добавьте новый спрайт в SPRITE_CONFIG и tools/utils.ts");
        }
    }, [spriteName]);
    const layout = spriteName ? getCharacterLayout({
        spriteName, sceneWidth: sceneSize.width, sceneHeight: sceneSize.height,
        side, mode, heightModifier, yModifier, xModifier,
    }) : null;

    // Не показываем промежуточную позицию до измерения родителя.
    // При смене позы персонажа размер сцены уже известен: новое лицо сразу на месте.
    return (
        <View pointerEvents="none" onLayout={onLayout} style={styles.layer}>
            {layout && (
                <View style={{
                    position: "absolute", left: layout.left, top: layout.top,
                    width: layout.width, height: layout.height,
                    overflow: "visible",
                }}>
                    <Sprite width={layout.width} height={layout.height}
                            preserveAspectRatio="xMidYMid meet" />
                    {DEBUG_CHARACTER_LAYOUT && (
                        <View style={[StyleSheet.absoluteFill, styles.debugFrame]} />
                    )}
                </View>
            )}
            {DEBUG_CHARACTER_LAYOUT && layout && (
                <View style={[styles.debugAnchor, { left: layout.eyeX - 4, top: layout.eyeY - 4 }]} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    layer: { ...StyleSheet.absoluteFill, overflow: "visible", zIndex: 40, elevation: 40 },
    debugFrame: { borderWidth: 1, borderColor: "#00D6FF" },
    debugAnchor: { position: "absolute", width: 8, height: 8, borderRadius: 4, backgroundColor: "#FF304F" },
});
