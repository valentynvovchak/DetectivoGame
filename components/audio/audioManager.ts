import { Audio } from "expo-av";

let currentSound: Audio.Sound | null = null;
let currentTrack: any = null;

// 🔒 токен последнего запроса
let playRequestId = 0;

export async function playMusic(source: any, volume: number) {
    const requestId = ++playRequestId;

    try {
        // Если уже играет тот же трек — просто обновим громкость
        if (currentTrack === source && currentSound) {
            await currentSound.setVolumeAsync(volume);
            return;
        }

        // Останавливаем предыдущий звук (если был)
        // ⚠️ важно: после await может прийти новый запрос
        if (currentSound) {
            try {
                await currentSound.stopAsync();
            } catch {}
            try {
                await currentSound.unloadAsync();
            } catch {}
            currentSound = null;
            currentTrack = null;
        }

        // Если за время stop/unload пришёл новый запрос — выходим
        if (requestId !== playRequestId) return;

        const { sound } = await Audio.Sound.createAsync(source, {
            isLooping: true,
            volume,
            shouldPlay: false, // сами решим когда стартовать
        });

        // Если пришёл новый запрос — не стартуем, а аккуратно выгружаем
        if (requestId !== playRequestId) {
            try {
                await sound.unloadAsync();
            } catch {}
            return;
        }

        currentSound = sound;
        currentTrack = source;

        await sound.playAsync();

        // Если после play пришёл новый запрос — выключаем этот звук
        if (requestId !== playRequestId) {
            try {
                await sound.stopAsync();
            } catch {}
            try {
                await sound.unloadAsync();
            } catch {}
            if (currentSound === sound) {
                currentSound = null;
                currentTrack = null;
            }
        }
    } catch (e) {
        console.warn("Audio error:", e);
    }
}

export async function stopMusic() {
    // ✅ тоже увеличиваем токен, чтобы отменить любой playMusic “в полёте”
    playRequestId++;

    if (currentSound) {
        try {
            await currentSound.stopAsync();
        } catch {}
        try {
            await currentSound.unloadAsync();
        } catch {}
        currentSound = null;
        currentTrack = null;
    }
}

export async function setMusicVolume(volume: number) {
    if (currentSound) {
        try {
            await currentSound.setVolumeAsync(volume);
        } catch {}
    }
}


/*
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
*/
