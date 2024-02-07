/* eslint-disable no-underscore-dangle */
import { Injectable } from '@angular/core';
import { KeyBindingService } from './key-binding.service';
import { TimerService } from './timer-service';

@Injectable({
    providedIn: 'root',
})
export class GameDependenciesProviderService {
    constructor(
        private readonly _timerService: TimerService,
        private readonly _keyBindingService: KeyBindingService,
    ) {}

    get timerService(): TimerService {
        return this._timerService;
    }

    get keyBindingService(): KeyBindingService {
        return this._keyBindingService;
    }
}
