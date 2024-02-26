import { Injectable } from '@angular/core';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { EvaluationPayload } from '@common/evaluation-payload';
import { JoinGamePayload } from '@common/join-game-payload';
import { Player } from '@common/player';
import { Submission } from '@common/submission';
import { GameState } from '@common/game-state';
import { Subscription } from 'rxjs';

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

    onJoinGame(callback: (payload: JoinGamePayload) => void): Subscription {
        return this.webSocketService.on('joinGame', callback);
    }

    cancelGame(pin: string) {
        this.webSocketService.emit('cancelGame', { pin });
    }

    onCancelGame(callback: () => void): Subscription {
        return this.webSocketService.on('cancelGame', callback);
    }

    playerAbandon(pin: string, username: string) {
        this.webSocketService.emit('playerAbandon', { pin, username });
    }

    onPlayerAbandon(callback: (players: Player[]) => void): Subscription {
        return this.webSocketService.on('playerAbandon', callback);
    }

    playerBan(pin: string, username: string) {
        this.webSocketService.emit('playerBan', { pin, username });
    }

    onPlayerBan(callback: (players: Player[]) => void): Subscription {
        return this.webSocketService.on('playerBan', callback);
    }

    selectChoice(pin: string, choiceIndex: number) {
        this.webSocketService.emit('selectChoice', { pin, choiceIndex });
    }

    onSelectChoice(callback: (submissions: Submission[]) => void): Subscription {
        return this.webSocketService.on('selectChoice', callback);
    }

    submitChoices(pin: string) {
        this.webSocketService.emit('submitChoices', { pin });
    }

    onSubmitChoices(callback: (payload: EvaluationPayload) => void): Subscription {
        return this.webSocketService.on('submitChoices', callback);
    }

    toggleGameLock(pin: string) {
        this.webSocketService.emit('toggleGameLock', { pin });
    }

    onToggleGameLock(callback: (gameState: GameState) => void): Subscription {
        return this.webSocketService.on('toggleGameLock', callback);
    }
}
