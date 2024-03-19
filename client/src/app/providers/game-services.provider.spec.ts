import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GameHttpService } from '@app/services/game-http/game-http.service';
import { GameService } from '@app/services/game/game-service/game.service';
import { KeyBindingService } from '@app/services/key-binding/key-binding.service';
import { MessageService } from '@app/services/message/message.service';
import { PlayerService } from '@app/services/player/player.service';
import { TimerService } from '@app/services/timer/timer.service';
import { GameServicesProvider } from './game-services.provider';

describe('GameServicesProvider', () => {
    let provider: GameServicesProvider;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [GameHttpService, GameService, TimerService, MessageService, PlayerService, KeyBindingService, MatSnackBar],
            imports: [HttpClientTestingModule],
        });
        provider = TestBed.inject(GameServicesProvider);
    });

    it('should be created', () => {
        expect(provider).toBeTruthy();
    });

    it('should provide instance of GameHttpService', () => {
        const service = provider.gameHttpService;
        expect(service instanceof GameHttpService).toBeTruthy();
    });

    it('should provide instance of GameService', () => {
        const service = provider.gameService;
        expect(service instanceof GameService).toBeTruthy();
    });

    it('should provide instance of TimerService', () => {
        const service = provider.timerService;
        expect(service instanceof TimerService).toBeTruthy();
    });

    it('should provide instance of MessageService', () => {
        const service = provider.messageService;
        expect(service instanceof MessageService).toBeTruthy();
    });

    it('should provide instance of PlayerService', () => {
        const service = provider.playerService;
        expect(service instanceof PlayerService).toBeTruthy();
    });

    it('should provide instance of KeyBindingService', () => {
        const service = provider.keyBindingService;
        expect(service instanceof KeyBindingService).toBeTruthy();
    });
});
