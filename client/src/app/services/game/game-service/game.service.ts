import { Injectable } from '@angular/core';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { applyIfPinMatches } from '@app/utils/conditional-applications/conditional-applications';
import { BarchartSubmission } from '@common/barchart-submission';
import { GameEvent } from '@common/game-event-enum';
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
        this.webSocketService.emit(GameEvent.CREATE_GAME_EVENT, { quizId });
    }

    onCreateGame(callback: (pin: string) => void): Subscription {
        return this.webSocketService.on(GameEvent.CREATE_GAME_EVENT, callback);
    }

    joinGame(pin: string, username: string) {
        this.webSocketService.emit(GameEvent.JOIN_GAME_EVENT, { pin, username });
    }

    onJoinGame(pin: string, callback: (player: Player) => void): Subscription {
        return this.webSocketService.on(GameEvent.JOIN_GAME_EVENT, applyIfPinMatches(pin, callback));
    }

    cancelGame(pin: string) {
        this.webSocketService.emit(GameEvent.CANCEL_GAME_EVENT, { pin });
    }

    onCancelGame(pin: string, callback: (message: string) => void): Subscription {
        return this.webSocketService.on(GameEvent.CANCEL_GAME_EVENT, applyIfPinMatches(pin, callback));
    }

    startGame(pin: string) {
        this.webSocketService.emit(GameEvent.START_GAME_EVENT, { pin });
    }

    onStartGame(pin: string, callback: (data: QuestionPayload) => void): Subscription {
        return this.webSocketService.on(GameEvent.START_GAME_EVENT, applyIfPinMatches(pin, callback));
    }

    qcmToggleChoice(pin: string, choiceIndex: number) {
        this.webSocketService.emit(GameEvent.QCM_TOGGLE_CHOICE_EVENT, { pin, choiceIndex });
    }

    onQcmToggleChoice(pin: string, callback: (payload: BarchartSubmission) => void): Subscription {
        return this.webSocketService.on(GameEvent.QCM_TOGGLE_CHOICE_EVENT, applyIfPinMatches(pin, callback));
    }

    qcmSubmit(pin: string) {
        this.webSocketService.emit(GameEvent.QCM_SUBMIT_EVENT, { pin });
    }

    onQcmSubmit(pin: string, callback: (evaluation: QcmEvaluation) => void): Subscription {
        return this.webSocketService.on(GameEvent.QCM_SUBMIT_EVENT, applyIfPinMatches(pin, callback));
    }

    qrlInputChange(pin: string, isTyping: boolean) {
        this.webSocketService.emit(GameEvent.QRL_INPUT_CHANGE_EVENT, { pin, isTyping });
    }

    onQrlInputChange(pin: string, callback: (submission: BarchartSubmission) => void): Subscription {
        return this.webSocketService.on(GameEvent.QRL_INPUT_CHANGE_EVENT, applyIfPinMatches(pin, callback));
    }

    qrlSubmit(pin: string, answer: string) {
        this.webSocketService.emit(GameEvent.QRL_SUBMIT_EVENT, { pin, answer });
    }

    onQrlSubmit(pin: string, callback: (qrlSubmission: QrlSubmission) => void): Subscription {
        return this.webSocketService.on(GameEvent.QRL_SUBMIT_EVENT, applyIfPinMatches(pin, callback));
    }

    qrlEvaluate(socketId: string, pin: string, grade: Grade) {
        this.webSocketService.emit(GameEvent.QRL_EVALUATE_EVENT, { socketId, pin, grade });
    }

    onQrlEvaluate(pin: string, callback: (evaluation: QrlEvaluation) => void): Subscription {
        return this.webSocketService.on(GameEvent.QRL_EVALUATE_EVENT, applyIfPinMatches(pin, callback));
    }

    nextQuestion(pin: string) {
        this.webSocketService.emit(GameEvent.NEXT_QUESTION_EVENT, { pin });
    }

    onNextQuestion(pin: string, callback: (data: QuestionPayload) => void): Subscription {
        return this.webSocketService.on(GameEvent.NEXT_QUESTION_EVENT, applyIfPinMatches(pin, callback));
    }

    toggleGameLock(pin: string) {
        this.webSocketService.emit(GameEvent.TOGGLE_GAME_LOCK_EVENT, { pin });
    }

    onToggleGameLock(pin: string, callback: (gameState: GameState) => void): Subscription {
        return this.webSocketService.on(GameEvent.TOGGLE_GAME_LOCK_EVENT, applyIfPinMatches(pin, callback));
    }

    endGame(pin: string) {
        this.webSocketService.emit(GameEvent.END_GAME_EVENT, { pin });
    }

    onEndGame(pin: string, callback: () => void): Subscription {
        return this.webSocketService.on(GameEvent.END_GAME_EVENT, applyIfPinMatches(pin, callback));
    }
}
