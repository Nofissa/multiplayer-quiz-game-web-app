import { Injectable } from '@angular/core';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { Evaluation } from '@common/evaluation';
import { GameInitBundle } from '@common/game-init-bundle';
import { GameEventPayload } from '@common/game-event-payload';
import { Player } from '@common/player';
import { Submission } from '@common/submission';
import { GameState } from '@common/game-state';
import { Subscription } from 'rxjs';
import { applyIfPinMatches } from '@app/utils/condition-applications/conditional-applications';

@Injectable({
    providedIn: 'root',
})
export class GameService {
    constructor(private readonly webSocketService: WebSocketService) {}

    createGame(quizId: string) {
        this.webSocketService.emit('createGame', { quizId });
    }

    onCreateGame(callback: (pin: string) => void): Subscription {
        return this.webSocketService.on('createGame', callback);
    }

    joinGame(pin: string, username: string) {
        this.webSocketService.emit('joinGame', { pin, username });
    }

    onJoinGame(pin: string, callback: (bundle: GameInitBundle) => void): Subscription {
        return this.webSocketService.on('joinGame', applyIfPinMatches(pin, callback));
    }

    onJoinGameNoPin(callback: (payload: GameEventPayload<GameInitBundle>) => void): Subscription {
        return this.webSocketService.on('joinGame', callback);
    }

    cancelGame(pin: string) {
        this.webSocketService.emit('cancelGame', { pin });
    }

    onCancelGame(pin: string, callback: (message: string) => void): Subscription {
        return this.webSocketService.on('cancelGame', applyIfPinMatches(pin, callback));
    }

    playerAbandon(pin: string, username: string) {
        this.webSocketService.emit('playerAbandon', { pin, username });
    }

    onPlayerAbandon(pin: string, callback: (quitter: Player) => void): Subscription {
        return this.webSocketService.on('playerAbandon', applyIfPinMatches(pin, callback));
    }

    playerBan(pin: string, username: string) {
        this.webSocketService.emit('playerBan', { pin, username });
    }

    onPlayerBan(pin: string, callback: (bannedPlayer: Player) => void): Subscription {
        return this.webSocketService.on('playerBan', applyIfPinMatches(pin, callback));
    }

    toggleSelectChoice(pin: string, choiceIndex: number) {
        this.webSocketService.emit('toggleSelectChoice', { pin, choiceIndex });
    }

    onToggleSelectChoice(pin: string, callback: (payload: Submission) => void): Subscription {
        return this.webSocketService.on('toggleSelectChoice', applyIfPinMatches(pin, callback));
    }

    submitChoices(pin: string) {
        this.webSocketService.emit('submitChoices', { pin });
    }

    onSubmitChoices(pin: string, callback: (evaluation: Evaluation) => void): Subscription {
        return this.webSocketService.on('submitChoices', applyIfPinMatches(pin, callback));
    }

    toggleGameLock(pin: string) {
        this.webSocketService.emit('toggleGameLock', { pin });
    }

    onToggleGameLock(pin: string, callback: (gameState: GameState) => void): Subscription {
        return this.webSocketService.on('toggleGameLock', applyIfPinMatches(pin, callback));
    }
}
