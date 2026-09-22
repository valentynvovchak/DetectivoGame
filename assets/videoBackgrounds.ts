
export const VIDEO_BACKGROUNDS = {
    walk_to_car: require(
        "./videos/walk_to_car.mp4"
    ),
} as const;

export type VideoBackgroundKey =
    keyof typeof VIDEO_BACKGROUNDS;