import { Asset } from "expo-asset";
import { Audio } from "expo-av";

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
        onProgress?.(total === 0 ? 1 : done / total);
    };

    // картинки
    const imagePromises = images.map(async (img) => {
        await Asset.fromModule(img).downloadAsync();
        tick();
    });

    // аудио (создать+unload, чтобы файл попал в cache)
    const soundPromises = sounds.map(async (s) => {
        const { sound } = await Audio.Sound.createAsync(s, { shouldPlay: false });
        await sound.unloadAsync();
        tick();
    });

    await Promise.all([...imagePromises, ...soundPromises]);
}
