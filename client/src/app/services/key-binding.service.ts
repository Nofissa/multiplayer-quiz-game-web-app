import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class KeyBindingService {
    private keyBindings: { [key: string]: () => void } = {};

    registerKeyBinding(hotkey: string, callback: () => void) {
        this.keyBindings[hotkey] = callback;
    }

    getExecutor(hotkey: string): () => void | undefined {
        return this.keyBindings[hotkey];
    }
}
