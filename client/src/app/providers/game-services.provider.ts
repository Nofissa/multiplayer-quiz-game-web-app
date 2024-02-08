/* eslint-disable no-underscore-dangle */
import { Injectable } from '@angular/core';
import { KeyBindingService } from '@app/services/key-binding.service';
import { TimerService } from '@app/services/timer-service';

@Injectable({
    providedIn: 'root',
})
export class GameServicesProvider {
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
