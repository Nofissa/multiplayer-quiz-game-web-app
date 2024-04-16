import { Injectable } from '@angular/core';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { applyIfPinMatches } from '@app/utils/conditional-applications/conditional-applications';
import { BarchartSubmission } from '@common/barchart-submission';
import { GameEvent } from '@common/game-event';
import { GameState } from '@common/game-state';
import { Grade } from '@common/grade';
import { Player } from '@common/player';
import { QcmEvaluation } from '@common/qcm-evaluation';
import { QrlEvaluation } from '@common/qrl-evaluation';
import { QrlSubmission } from '@common/qrl-submission';
import { QuestionPayload } from '@common/question-payload';
import { Subscription } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class GameService {
    constructor(private readonly webSocketService: WebSocketService) {}

    createGame(quizId?: string) {
        this.webSocketService.emit(GameEvent.CreateGame, { quizId });
    }

    onCreateGame(callback: (pin: string) => void): Subscription {
        return this.webSocketService.on(GameEvent.CreateGame, callback);
    }

    joinGame(pin: string, username: string) {
        this.webSocketService.emit(GameEvent.JoinGame, { pin, username });
    }

    onJoinGame(pin: string, callback: (player: Player) => void): Subscription {
        return this.webSocketService.on(GameEvent.JoinGame, applyIfPinMatches(pin, callback));
    }

    cancelGame(pin: string) {
        this.webSocketService.emit(GameEvent.CancelGame, { pin });
    }

    onCancelGame(pin: string, callback: (message: string) => void): Subscription {
        return this.webSocketService.on(GameEvent.CancelGame, applyIfPinMatches(pin, callback));
    }

    startGame(pin: string) {
        this.webSocketService.emit(GameEvent.StartGame, { pin });
    }

    onStartGame(pin: string, callback: (data: QuestionPayload) => void): Subscription {
        return this.webSocketService.on(GameEvent.StartGame, applyIfPinMatches(pin, callback));
    }

    qcmToggleChoice(pin: string, choiceIndex: number) {
        this.webSocketService.emit(GameEvent.QcmToggleChoice, { pin, choiceIndex });
    }

    onQcmToggleChoice(pin: string, callback: (payload: BarchartSubmission) => void): Subscription {
        return this.webSocketService.on(GameEvent.QcmToggleChoice, applyIfPinMatches(pin, callback));
    }

    qcmSubmit(pin: string) {
        this.webSocketService.emit(GameEvent.QcmSubmit, { pin });
    }

    onQcmSubmit(pin: string, callback: (evaluation: QcmEvaluation) => void): Subscription {
        return this.webSocketService.on(GameEvent.QcmSubmit, applyIfPinMatches(pin, callback));
    }

    qrlInputChange(pin: string, isTyping: boolean) {
        this.webSocketService.emit(GameEvent.QrlInputChange, { pin, isTyping });
    }

    onQrlInputChange(pin: string, callback: (submission: BarchartSubmission) => void): Subscription {
        return this.webSocketService.on(GameEvent.QrlInputChange, applyIfPinMatches(pin, callback));
    }

    qrlSubmit(pin: string, answer: string) {
        this.webSocketService.emit(GameEvent.QrlSubmit, { pin, answer });
    }

    onQrlSubmit(pin: string, callback: (qrlSubmission: QrlSubmission) => void): Subscription {
        return this.webSocketService.on(GameEvent.QrlSubmit, applyIfPinMatches(pin, callback));
    }

    qrlEvaluate(socketId: string, pin: string, grade: Grade) {
        this.webSocketService.emit(GameEvent.QrlEvaluate, { socketId, pin, grade });
    }

    onQrlEvaluate(pin: string, callback: (evaluation: QrlEvaluation) => void): Subscription {
        return this.webSocketService.on(GameEvent.QrlEvaluate, applyIfPinMatches(pin, callback));
    }

    nextQuestion(pin: string) {
        this.webSocketService.emit(GameEvent.NextQuestion, { pin });
    }

    onNextQuestion(pin: string, callback: (data: QuestionPayload) => void): Subscription {
        return this.webSocketService.on(GameEvent.NextQuestion, applyIfPinMatches(pin, callback));
    }

    toggleGameLock(pin: string) {
        this.webSocketService.emit(GameEvent.ToggleGameLock, { pin });
    }

    onToggleGameLock(pin: string, callback: (gameState: GameState) => void): Subscription {
        return this.webSocketService.on(GameEvent.ToggleGameLock, applyIfPinMatches(pin, callback));
    }

    endGame(pin: string) {
        this.webSocketService.emit(GameEvent.EndGame, { pin });
    }

    onEndGame(pin: string, callback: () => void): Subscription {
        return this.webSocketService.on(GameEvent.EndGame, applyIfPinMatches(pin, callback));
    }
}
