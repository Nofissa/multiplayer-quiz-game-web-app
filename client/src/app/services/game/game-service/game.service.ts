import { Injectable } from '@angular/core';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { applyIfPinMatches } from '@app/utils/conditional-applications/conditional-applications';
import { GameState } from '@common/game-state';
import { Player } from '@common/player';
import { QcmEvaluation } from '@common/qcm-evaluation';
import { QrlEvaluation } from '@common/qrl-evaluation';
import { QrlSubmission } from '@common/qrl-submission';
import { QuestionPayload } from '@common/question-payload';
import { Submission } from '@common/submission';
import { Subscription } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class GameService {
    constructor(private readonly webSocketService: WebSocketService) {}

    createGame(quizId?: string) {
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

    qcmToggleChoice(pin: string, choiceIndex: number) {
        this.webSocketService.emit('qcmToggleChoice', { pin, choiceIndex });
    }

    onQcmToggleChoice(pin: string, callback: (payload: Submission[]) => void): Subscription {
        return this.webSocketService.on('qcmToggleChoice', applyIfPinMatches(pin, callback));
    }

    qcmSubmit(pin: string) {
        this.webSocketService.emit('qcmSubmit', { pin });
    }

    onQcmSubmit(pin: string, callback: (evaluation: QcmEvaluation) => void): Subscription {
        return this.webSocketService.on('qcmSubmit', applyIfPinMatches(pin, callback));
    }

    qrlInputChange(pin: string, isTyping: boolean) {
        this.webSocketService.emit('qrlInputChange', { pin, isTyping });
    }

    onQrlInputChange(pin: string, callback: (activePlayers: boolean[]) => void): Subscription {
        return this.webSocketService.on('qrlInputChange', applyIfPinMatches(pin, callback));
    }

    qrlSubmit(pin: string, text: string) {
        this.webSocketService.emit('qrlSubmit', { pin, text });
    }

    onQrlSubmit(pin: string, callback: (qrlSubmission: QrlSubmission) => void): Subscription {
        return this.webSocketService.on('qrlSubmit', applyIfPinMatches(pin, callback));
    }

    qrlEvaluate(pin: string, evaluation: QrlEvaluation) {
        this.webSocketService.emit('qrlEvaluate', { pin, evaluation });
    }

    onQrlEvaluate(pin: string, callback: (evaluation: QrlEvaluation) => void): Subscription {
        return this.webSocketService.on('qrlEvaluate', applyIfPinMatches(pin, callback));
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

    endGame(pin: string) {
        this.webSocketService.emit('endGame', { pin });
    }

    onEndGame(pin: string, callback: () => void): Subscription {
        return this.webSocketService.on('endGame', applyIfPinMatches(pin, callback));
    }
}
