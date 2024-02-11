/* eslint-disable no-underscore-dangle */
import { Injectable } from '@angular/core';
import { KeyBindingService } from '@app/services/key-binding.service';
import { TimerService } from '@app/services/timer-service';

@Injectable({
    providedIn: 'root',
})
export class GameServicesProvider {
    constructor(
        readonly timerService: TimerService,
        readonly keyBindingService: KeyBindingService,
    ) {}

    get timer(): TimerService {
        return this.timerService;
    }

    get keyBinding(): KeyBindingService {
        return this.keyBindingService;
    }
}
