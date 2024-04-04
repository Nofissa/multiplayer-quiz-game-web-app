import { Injectable } from '@angular/core';
import { GameHttpService } from '@app/services/game-http/game-http.service';
import { GameService } from '@app/services/game/game-service/game.service';
import { KeyBindingService } from '@app/services/key-binding/key-binding.service';
import { MessageService } from '@app/services/message/message.service';
import { PlayerService } from '@app/services/player/player.service';
import { SoundService } from '@app/services/sound/sound.service';
import { TimerService } from '@app/services/timer/timer.service';

@Injectable({
    providedIn: 'root',
})
export class GameServicesProvider {
    // Disabled as this is a dependency provider class
    // eslint-disable-next-line max-params
    constructor(
        private readonly gameHttp: GameHttpService,
        private readonly game: GameService,
        private readonly timer: TimerService,
        private readonly message: MessageService,
        private readonly player: PlayerService,
        private readonly keyBinding: KeyBindingService,
        private readonly sound: SoundService,
    ) {}

    get gameHttpService(): GameHttpService {
        return this.gameHttp;
    }

    get gameService(): GameService {
        return this.game;
    }

    get timerService(): TimerService {
        return this.timer;
    }

    get messageService(): MessageService {
        return this.message;
    }

    get playerService(): PlayerService {
        return this.player;
    }

    get keyBindingService(): KeyBindingService {
        return this.keyBinding;
    }

    get soundService(): SoundService {
        return this.sound;
    }
}
