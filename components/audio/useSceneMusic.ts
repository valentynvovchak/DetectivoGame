import { useEffect } from "react";
import { playMusic, setMusicVolume } from "@/components/audio/audioManager";
import { useGameStore } from "@/store/gameStore";

export function useSceneMusic(track: any) {
    const volume = useGameStore((s) => s.volume);

    useEffect(() => {
        if (!track) return;
        playMusic(track, volume);
    }, [track]);

    useEffect(() => {
        setMusicVolume(volume);
    }, [volume]);
}