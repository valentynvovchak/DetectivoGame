import { BACKGROUNDS } from "@/tools/utils";
import { RESOURCES } from "@/assets/resources";
import { MUSIC } from "@/components/audio/musicMap";

export const PRELOAD_IMAGES = [
    require("@/assets/logo-removebg.png"),
    require("@/assets/ui/bubble.png"),
    require("@/assets/ui/notebook_bg.png"),
    require("@/assets/ui/прямая речь прямоугольник для игры готовый 1.png"),
    require("@/assets/ui/bubble_avatar.png"),
    ...Object.values(BACKGROUNDS),
    ...Object.values(RESOURCES),
];

export const PRELOAD_SOUNDS = [
    ...Object.values(MUSIC),
];