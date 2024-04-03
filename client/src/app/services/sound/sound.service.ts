import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class SoundService {
    private audioContext: AudioContext = new AudioContext();
    private audios: Map<string, HTMLAudioElement> = new Map();

    loadSound(name: string, path: string): void {
        if (!this.audios.has(name)) {
            this.audios.set(name, new Audio(path));
        }
    }

    playSound(name: string): void {
        const audio = this.audios.get(name);

        if (audio) {
            this.play(audio);
        }
    }

    stopSound(name: string): void {
        const audio = this.audios.get(name);

        if (audio) {
            this.stop(audio);
        }
    }

    private play(audio: HTMLAudioElement) {
        const source = this.audioContext.createMediaElementSource(audio);

        source.connect(this.audioContext.destination);
        audio.play();
    }

    private stop(audio: HTMLAudioElement) {
        audio.pause();
        audio.currentTime = 0;
    }
}
