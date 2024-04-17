import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class SoundService {
    private audioContext: AudioContext = new AudioContext();
    private audios: Map<string, HTMLAudioElement> = new Map();
    private source: MediaElementAudioSourceNode;

    loadSound(name: string, path: string): void {
        let audio = this.audios.get(name);
        if (!audio) {
            audio = new Audio(path);
            this.audios.set(name, audio);
        }
        audio.crossOrigin = 'anonymous';

        if (!this.source) {
            this.source = this.audioContext.createMediaElementSource(audio);
            this.source.connect(this.audioContext.destination);
        }
    }

    playSound(name: string): void {
        this.audioContext.resume();
        const audio = this.audios.get(name);

        if (audio) {
            this.play(audio);
        }
    }

    stopSound(name: string): void {
        this.audioContext.suspend();
        const audio = this.audios.get(name);

        if (audio) {
            this.stop(audio);
        }
    }

    private play(audio: HTMLAudioElement) {
        audio.play();
    }

    private stop(audio: HTMLAudioElement) {
        audio.pause();
        audio.currentTime = 0;
    }
}
