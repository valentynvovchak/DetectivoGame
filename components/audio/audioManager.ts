import { createAudioPlayer } from "expo-audio";

type Player = ReturnType<typeof createAudioPlayer>;

let currentPlayer: Player | null = null;
let currentTrack: any = null;

// Токен останнього запиту.
// Потрібен, щоб старий playMusic не переміг новіший.
let playRequestId = 0;

function disposePlayer(player: Player | null) {
    if (!player) return;

    try {
        player.pause();
    } catch {}

    try {
        player.remove();
    } catch {}
}

export async function playMusic(source: any, volume: number) {
    const requestId = ++playRequestId;

    try {
        // Якщо вже грає той самий трек —
        // просто змінюємо гучність.
        if (currentTrack === source && currentPlayer) {
            currentPlayer.volume = volume;
            return;
        }

        // Прибираємо попередній трек.
        if (currentPlayer) {
            const oldPlayer = currentPlayer;

            currentPlayer = null;
            currentTrack = null;

            disposePlayer(oldPlayer);
        }

        // За цей час міг прийти новіший запит.
        if (requestId !== playRequestId) {
            return;
        }

        const player = createAudioPlayer(source);

        player.loop = true;
        player.volume = volume;

        // Перевіряємо ще раз перед запуском.
        if (requestId !== playRequestId) {
            disposePlayer(player);
            return;
        }

        currentPlayer = player;
        currentTrack = source;

        player.play();

        // Якщо одразу після запуску прийшов новий запит.
        if (requestId !== playRequestId) {
            disposePlayer(player);

            if (currentPlayer === player) {
                currentPlayer = null;
                currentTrack = null;
            }
        }
    } catch (error) {
        console.warn("Audio error:", error);
    }
}

export async function stopMusic() {
    // Скасовуємо будь-який playMusic, який ще виконується.
    playRequestId++;

    if (currentPlayer) {
        const player = currentPlayer;

        currentPlayer = null;
        currentTrack = null;

        disposePlayer(player);
    }
}

export async function setMusicVolume(volume: number) {
    if (currentPlayer) {
        try {
            currentPlayer.volume = volume;
        } catch {}
    }
}