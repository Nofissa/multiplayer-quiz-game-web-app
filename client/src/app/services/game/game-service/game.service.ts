import { Injectable } from '@angular/core';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { applyIfPinMatches } from '@app/utils/conditional-applications/conditional-applications';
import { Evaluation } from '@common/evaluation';
import { GameState } from '@common/game-state';
import { Player } from '@common/player';
import { QuestionPayload } from '@common/question-payload';
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

    onStartGame(pin: string, callback: (data: QuestionPayload) => void): Subscription {
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

    playerMute(pin: string, choiceIndex: number) {
        this.webSocketService.emit('playerMute', { pin, choiceIndex });
    }

    onPlayerMute(pin: string, callback: (payload: Submission[]) => void): Subscription {
        return this.webSocketService.on('playerMute', applyIfPinMatches(pin, callback));
    }

    qcmToggleChoice(pin: string, choiceIndex: number) {
        this.webSocketService.emit('qcmToggleChoice', { pin, choiceIndex });
    }

    onQcmToggleChoice(pin: string, callback: (payload: Submission[]) => void): Subscription {
        return this.webSocketService.on('qcmToggleChoice', applyIfPinMatches(pin, callback));
    }

    qcmSubmit(pin: string) {
        this.webSocketService.emit('qcmSubmit', { pin });
    }

    onQcmSubmit(pin: string, callback: (evaluation: Evaluation) => void): Subscription {
        return this.webSocketService.on('qcmSubmit', applyIfPinMatches(pin, callback));
    }

    qrlInputChange(pin: string, choiceIndex: number) {
        this.webSocketService.emit('qrlInputChange', { pin, choiceIndex });
    }

    onQrlInputChange(pin: string, callback: (payload: Submission[]) => void): Subscription {
        return this.webSocketService.on('qrlInputChange', applyIfPinMatches(pin, callback));
    }

    qrlSubmit(pin: string, choiceIndex: number) {
        this.webSocketService.emit('qrlSubmit', { pin, choiceIndex });
    }

    onQrlSubmit(pin: string, callback: (payload: Submission[]) => void): Subscription {
        return this.webSocketService.on('qrlSubmit', applyIfPinMatches(pin, callback));
    }

    nextQuestion(pin: string) {
        this.webSocketService.emit('nextQuestion', { pin });
    }

    onNextQuestion(pin: string, callback: (data: QuestionPayload) => void): Subscription {
        return this.webSocketService.on('nextQuestion', applyIfPinMatches(pin, callback));
    }

    toggleGameLock(pin: string) {
        this.webSocketService.emit('toggleGameLock', { pin });
    }

    onToggleGameLock(pin: string, callback: (gameState: GameState) => void): Subscription {
        return this.webSocketService.on('toggleGameLock', applyIfPinMatches(pin, callback));
    }

    playerLeaveGameEnd(pin: string) {
        this.webSocketService.emit('playerLeaveGame', { pin });
    }

    endGame(pin: string) {
        this.webSocketService.emit('endGame', { pin });
    }

    onEndGame(pin: string, callback: () => void): Subscription {
        return this.webSocketService.on('endGame', applyIfPinMatches(pin, callback));
    }
}
