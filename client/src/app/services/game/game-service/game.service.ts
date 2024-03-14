import { Injectable } from '@angular/core';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { applyIfPinMatches } from '@app/utils/conditional-applications/conditional-applications';
import { Evaluation } from '@common/evaluation';
import { GameEventPayload } from '@common/game-event-payload';
import { GameState } from '@common/game-state';
import { Player } from '@common/player';
import { Question } from '@common/question';
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

    onJoinGame(pin: string, callback: (player: Player) => void): Subscription {
        return this.webSocketService.on('joinGame', applyIfPinMatches(pin, callback));
    }

    cancelGame(pin: string) {
        this.webSocketService.emit('cancelGame', { pin });
    }

    onCancelGame(pin: string, callback: (message: string) => void): Subscription {
        return this.webSocketService.on('cancelGame', applyIfPinMatches(pin, callback));
    }

    startGame(pin: string) {
        this.webSocketService.emit('startGame', { pin });
    }

    onStartGame(pin: string, callback: (question: Question) => void): Subscription {
        return this.webSocketService.on('startGame', applyIfPinMatches(pin, callback));
    }

    playerAbandon(pin: string) {
        this.webSocketService.emit('playerAbandon', { pin });
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

    onToggleSelectChoice(pin: string, callback: (payload: { clientId: string; submission: Submission }) => void): Subscription {
        return this.webSocketService.on('toggleSelectChoice', applyIfPinMatches(pin, callback));
    }

    submitChoices(pin: string) {
        this.webSocketService.emit('submitChoices', { pin });
    }

    onSubmitChoices(pin: string, callback: (evaluation: Evaluation) => void): Subscription {
        return this.webSocketService.on('submitChoices', applyIfPinMatches(pin, callback));
    }

    nextQuestion(pin: string) {
        this.webSocketService.emit('nextQuestion', { pin });
    }

    onNextQuestion(pin: string, callback: (question: Question) => void): Subscription {
        return this.webSocketService.on('nextQuestion', applyIfPinMatches(pin, callback));
    }

    toggleGameLock(pin: string) {
        this.webSocketService.emit('toggleGameLock', { pin });
    }

    onToggleGameLock(pin: string, callback: (gameState: GameState) => void): Subscription {
        return this.webSocketService.on('toggleGameLock', applyIfPinMatches(pin, callback));
    }

    sendPlayerResults(pin: string) {
        this.webSocketService.emit('sendPlayerResults', { pin });
    }

    onSendPlayerResults(
        callback: (chartData: GameEventPayload<{ submissions: Map<string, Submission>[]; questions: Question[] }>) => void,
    ): Subscription {
        return this.webSocketService.on('sendPlayerResults', callback);
    }

    playerLeaveGameEnd(pin: string) {
        this.webSocketService.emit('playerLeaveGame', { pin });
    }

    endGame(pin: string) {
        this.webSocketService.emit('endGame', { pin });
    }

    onEndGame(callback: (gameState: GameState) => void): Subscription {
        return this.webSocketService.on('endGame', callback);
    }
}
