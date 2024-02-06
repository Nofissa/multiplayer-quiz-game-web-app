import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class KeyBindingService {
    private keyBindings: { [key: string]: () => void } = {};

    registerKeyBinding(hotkey: string, callback: () => void) {
        this.keyBindings[hotkey] = callback;
    }

    execute(hotkey: string) {
        const callback = this.keyBindings[hotkey];

        if (callback) {
            callback();
        }
    }
}
