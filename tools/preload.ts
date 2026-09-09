import { Asset } from "expo-asset";
import { preload } from "expo-audio";

type ProgressCb = (p: number) => void;

export async function preloadAssetsWithProgress(
    images: any[],
    sounds: any[],
    onProgress?: ProgressCb
) {
    const total = images.length + sounds.length;
    let done = 0;

    const tick = () => {
        done += 1;
        onProgress?.(
            total === 0 ? 1 : done / total
        );
    };

    // Картинки
    const imagePromises = images.map(
        async (img) => {
            await Asset.fromModule(
                img
            ).downloadAsync();

            tick();
        }
    );

    // Аудіо
    const soundPromises = sounds.map(
        async (sound) => {
            await preload(sound);

            tick();
        }
    );

    await Promise.all([
        ...imagePromises,
        ...soundPromises,
    ]);
}