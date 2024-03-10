/* eslint-disable no-underscore-dangle */
import { Injectable } from '@angular/core';
import { GameCacheService } from '@app/services/game-cache/game-cache.service';
import { GameService } from '@app/services/game/game-service/game.service';
import { KeyBindingService } from '@app/services/key-binding/key-binding.service';
import { TimerService } from '@app/services/timer/timer.service';

@Injectable({
    providedIn: 'root',
})
export class GameServicesProvider {
    // Disabled as this is a dependency provider class
    // eslint-disable-next-line max-params
    constructor(
        private readonly gameCache: GameCacheService,
        private readonly game: GameService,
        private readonly timer: TimerService,
        private readonly keyBinding: KeyBindingService,
    ) {}

    get gameCacheService(): GameCacheService {
        return this.gameCache;
    }

    get gameService(): GameService {
        return this.game;
    }

    get timerService(): TimerService {
        return this.timer;
    }

    get keyBindingService(): KeyBindingService {
        return this.keyBinding;
    }
}
