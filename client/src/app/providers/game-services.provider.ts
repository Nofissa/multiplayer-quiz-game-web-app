/* eslint-disable no-underscore-dangle */
import { Injectable } from '@angular/core';
import { KeyBindingService } from '@app/services/key-binding/key-binding.service';
import { TimerService } from '@app/services/timer/timer.service';

@Injectable({
    providedIn: 'root',
})
export class GameServicesProvider {
    constructor(
        private readonly timerService: TimerService,
        private readonly keyBindingService: KeyBindingService,
    ) {}

    get timer(): TimerService {
        return this.timerService;
    }

    get keyBinding(): KeyBindingService {
        return this.keyBindingService;
    }
}
