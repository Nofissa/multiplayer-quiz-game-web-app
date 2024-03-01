import { Injectable } from '@angular/core';
import { Question } from '@app/interfaces/question';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { EvaluationPayload } from '@common/evaluation-payload';
import { GameState } from '@common/game-state';
import { JoinGamePayload } from '@common/join-game-payload';
import { Player } from '@common/player';
import { Submission } from '@common/submission';
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

    playerAbandon(pin: string) {
        this.webSocketService.emit('playerAbandon', { pin });
    }

    onPlayerAbandon(callback: (quitter: Player) => void): Subscription {
        return this.webSocketService.on('playerAbandon', callback);
    }

    playerBan(pin: string, username: string) {
        this.webSocketService.emit('playerBan', { pin, username });
    }

    onPlayerBan(callback: (bannedPlayer: Player) => void): Subscription {
        return this.webSocketService.on('playerBan', callback);
    }

    toggleSelectChoice(pin: string, choiceIndex: number) {
        this.webSocketService.emit('toggleSelectChoice', { pin, choiceIndex });
    }

    onToggleSelectChoice(callback: (submissions: Submission[]) => void): Subscription {
        return this.webSocketService.on('toggleSelectChoice', callback);
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

    onNextQuestion(callback: (question: Question) => void): Subscription {
        return this.webSocketService.on('nextQuestion', callback);
    }
}
