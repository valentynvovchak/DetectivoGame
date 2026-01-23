import { Audio } from "expo-av";

let currentSound: Audio.Sound | null = null;
let currentTrack: string | null = null;

export async function playMusic(
    source: any,
    volume: number
) {
    try {
        // если уже играет тот же трек — не перезапускаем
        if (currentTrack === source) {
            if (currentSound) {
                await currentSound.setVolumeAsync(volume);
            }
            return;
        }

        await stopMusic();

        const { sound } = await Audio.Sound.createAsync(
            source,
            {
                isLooping: true,
                volume,
            }
        );

        currentSound = sound;
        currentTrack = source;

        await sound.playAsync();
    } catch (e) {
        console.warn("Audio error:", e);
    }
}

export async function stopMusic() {
    if (currentSound) {
        await currentSound.stopAsync();
        await currentSound.unloadAsync();
        currentSound = null;
        currentTrack = null;
    }
}

export async function setMusicVolume(volume: number) {
    if (currentSound) {
        await currentSound.setVolumeAsync(volume);
    }
}
