import { TestBed } from '@angular/core/testing';
import { SocketServerMock } from '@app/mocks/socket-server-mock';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { firstPlayerStub } from '@app/test-stubs/player.stubs';
import { qcmQuestionStub } from '@app/test-stubs/question.stubs';
import { GameEventPayload } from '@common/game-event-payload';
import { GameState } from '@common/game-state';
import { Grade } from '@common/grade';
import { QcmEvaluation } from '@common/qcm-evaluation';
import { QcmSubmission } from '@common/qcm-submission';
import { QrlEvaluation } from '@common/qrl-evaluation';
import { QrlSubmission } from '@common/qrl-submission';
import { Question } from '@common/question';
import { QuestionPayload } from '@common/question-payload';
import { Observable } from 'rxjs';
import { io } from 'socket.io-client';
import { GameService } from './game.service';
import { QuestionType } from '@common/question-type';

describe('GameService', () => {
    let gameService: GameService;
    let webSocketServiceSpy: jasmine.SpyObj<WebSocketService>;
    let socketServerMock: SocketServerMock;
    const stubData = {
        pin1: '1234',
        pin2: '4321',
        createGameEventName: 'createGame',
        startGameEventName: 'startGame',
        playerLeaveEndGameEventName: 'playerLeaveGame',
        endGameEventName: 'endGame',
        joinGameEventName: 'joinGame',
        cancelGameEventName: 'cancelGame',
        playerAbandonEventName: 'playerAbandon',
        playerBanEventName: 'playerBan',
        toggleSelectChoiceEventName: 'qcmToggleChoice',
        submitChoicesEventName: 'qcmSubmit',
        getCurrentQuestionEventName: 'getCurrentQuestion',
        nextQuestionEventName: 'nextQuestion',
        toggleGameLockEventName: 'toggleGameLock',
        qrlInputChangeEventName: 'qrlInputChange',
        qrlSubmitEventName: 'qrlSubmit',
        qrlEvaluateEventName: 'qrlEvaluate',
        callback: jasmine.createSpy('callback'),
    };

    beforeEach(() => {
        webSocketServiceSpy = jasmine.createSpyObj('WebSocketService', ['emit', 'on', 'getSocketId'], {
            socketInstance: io(),
        });

        TestBed.configureTestingModule({
            providers: [GameService, { provide: WebSocketService, useValue: webSocketServiceSpy }],
        });

        gameService = TestBed.inject(GameService);
        webSocketServiceSpy = TestBed.inject(WebSocketService) as jasmine.SpyObj<WebSocketService>;
        webSocketServiceSpy.on.and.callFake(<T>(eventName: string, func: (data: T) => void) => {
            return new Observable<T>((observer) => {
                webSocketServiceSpy['socketInstance'].on(eventName, (data) => {
                    observer.next(data);
                });

                return () => {
                    webSocketServiceSpy['socketInstance'].off(eventName);
                };
            }).subscribe(func);
        });
        socketServerMock = new SocketServerMock([webSocketServiceSpy['socketInstance']]);
        stubData.callback.calls.reset();
    });

    it('should be created', () => {
        expect(gameService).toBeTruthy();
    });

    it('should raise createGame event', () => {
        const quizId = 'abc123';
        gameService.createGame(quizId);

        expect(webSocketServiceSpy.emit).toHaveBeenCalledWith(stubData.createGameEventName, { quizId });
    });

    it('should subscribe to createGame event and call the callback', () => {
        gameService.onCreateGame(stubData.callback);
        socketServerMock.emit(stubData.createGameEventName, stubData.pin1);

        expect(stubData.callback).toHaveBeenCalledWith(stubData.pin1);
    });

    it('should raise startGame event', () => {
        gameService.startGame(stubData.pin1);
        expect(webSocketServiceSpy.emit).toHaveBeenCalledWith(stubData.startGameEventName, { pin: stubData.pin1 });
    });

    it('should subscribe to startGame event and call the callback if pin matches', () => {
        gameService.onStartGame(stubData.pin1, stubData.callback);

        const questionPayload: QuestionPayload = { question: qcmQuestionStub()[0], isLast: false };
        const payload: GameEventPayload<QuestionPayload> = { pin: stubData.pin1, data: questionPayload };
        socketServerMock.emit(stubData.startGameEventName, payload);

        expect(stubData.callback).toHaveBeenCalledWith(questionPayload);
    });

    it('should raise endGame event', () => {
        gameService.endGame(stubData.pin1);
        expect(webSocketServiceSpy.emit).toHaveBeenCalledWith(stubData.endGameEventName, { pin: stubData.pin1 });
    });

    it('should subscribe to endGame event and call the callback if pin matches', () => {
        gameService.onEndGame(stubData.pin1, stubData.callback);

        const payload: GameEventPayload<unknown> = { pin: stubData.pin1, data: null };
        socketServerMock.emit(stubData.endGameEventName, payload);

        expect(stubData.callback).toHaveBeenCalledWith(null);
    });

    it('should raise joinGame event', () => {
        const username = 'user123';
        gameService.joinGame(stubData.pin1, username);

        expect(webSocketServiceSpy.emit).toHaveBeenCalledWith(stubData.joinGameEventName, { pin: stubData.pin1, username });
    });

    it('should subscribe to joinGame event and call the callback if pin matches', () => {
        gameService.onJoinGame(stubData.pin1, stubData.callback);

        const bundle = { players: [], chatlogs: [] };
        const payload = { pin: stubData.pin1, data: bundle };
        socketServerMock.emit(stubData.joinGameEventName, payload);

        expect(stubData.callback).toHaveBeenCalledWith(bundle);
    });

    it('should subscribe to joinGame event and not call the callback if pin does not match', () => {
        gameService.onJoinGame(stubData.pin1, stubData.callback);

        const bundle = { players: [], chatlogs: [] };
        const payload = { pin: stubData.pin2, data: bundle };
        socketServerMock.emit(stubData.joinGameEventName, payload);

        expect(stubData.callback).not.toHaveBeenCalled();
    });

    it('should raise cancelGame event', () => {
        gameService.cancelGame(stubData.pin1);
        expect(webSocketServiceSpy.emit).toHaveBeenCalledWith(stubData.cancelGameEventName, { pin: stubData.pin1 });
    });

    it('should subscribe to cancelGame event and call the callback if pin matches', () => {
        gameService.onCancelGame(stubData.pin1, stubData.callback);

        const message = 'Game cancelled';
        const payload: GameEventPayload<string> = { pin: stubData.pin1, data: message };
        socketServerMock.emit(stubData.cancelGameEventName, payload);

        expect(stubData.callback).toHaveBeenCalledWith(message);
    });

    it('should subscribe to cancelGame event and not call the callback if pin does not match', () => {
        gameService.onCancelGame(stubData.pin1, stubData.callback);

        const message = 'Game cancelled';
        const payload: GameEventPayload<string> = { pin: stubData.pin2, data: message };
        socketServerMock.emit(stubData.cancelGameEventName, payload);

        expect(stubData.callback).not.toHaveBeenCalled();
    });

    it('should raise toggleSelectChoice event', () => {
        const choiceIndex = 2;
        gameService.qcmToggleChoice(stubData.pin1, choiceIndex);

        expect(webSocketServiceSpy.emit).toHaveBeenCalledWith(stubData.toggleSelectChoiceEventName, { pin: stubData.pin1, choiceIndex });
    });

    it('should subscribe to toggleSelectChoice event and call the callback if pin matches', () => {
        gameService.onQcmToggleChoice(stubData.pin1, stubData.callback);

        const submission: QcmSubmission = { clientId: webSocketServiceSpy.getSocketId(), choices: [], isFinal: false };
        const payload: GameEventPayload<QcmSubmission> = { pin: stubData.pin1, data: submission };
        socketServerMock.emit(stubData.toggleSelectChoiceEventName, payload);

        expect(stubData.callback).toHaveBeenCalledWith(submission);
    });

    it('should subscribe to toggleSelectChoice event and not call the callback if pin does not match', () => {
        gameService.onQcmToggleChoice(stubData.pin1, stubData.callback);

        const submission: QcmSubmission = { clientId: webSocketServiceSpy.getSocketId(), choices: [], isFinal: false };
        const payload: GameEventPayload<QcmSubmission> = { pin: stubData.pin2, data: submission };
        socketServerMock.emit(stubData.toggleSelectChoiceEventName, payload);

        expect(stubData.callback).not.toHaveBeenCalled();
    });

    it('should raise submitChoices event', () => {
        gameService.qcmSubmit(stubData.pin1);
        expect(webSocketServiceSpy.emit).toHaveBeenCalledWith(stubData.submitChoicesEventName, { pin: stubData.pin1 });
    });

    it('should subscribe to submitChoices event and call the callback if pin matches', () => {
        gameService.onQcmSubmit(stubData.pin1, stubData.callback);
        const evaluation: QcmEvaluation = { player: firstPlayerStub(), correctAnswers: [], score: 80, isFirstCorrect: false, isLast: false };
        const payload: GameEventPayload<QcmEvaluation> = { pin: stubData.pin1, data: evaluation };
        socketServerMock.emit(stubData.submitChoicesEventName, payload);

        expect(stubData.callback).toHaveBeenCalledWith(evaluation);
    });

    it('should subscribe to submitChoices event and not call the callback if pin does not match', () => {
        gameService.onQcmSubmit(stubData.pin1, stubData.callback);
        const evaluation: QcmEvaluation = { player: firstPlayerStub(), correctAnswers: [], score: 80, isFirstCorrect: false, isLast: false };
        const payload: GameEventPayload<QcmEvaluation> = { pin: stubData.pin2, data: evaluation };
        socketServerMock.emit(stubData.submitChoicesEventName, payload);

        expect(stubData.callback).not.toHaveBeenCalled();
    });

    it('should raise nextQuestion event', () => {
        gameService.nextQuestion(stubData.pin1);
        expect(webSocketServiceSpy.emit).toHaveBeenCalledWith(stubData.nextQuestionEventName, { pin: stubData.pin1 });
    });

    it('should subscribe to nextQuestion event and call the callback if pin matches', () => {
        gameService.onNextQuestion(stubData.pin1, stubData.callback);
        const question: Question = { _id: '', text: 'What is 2+2', type: QuestionType.QCM, points: 100, choices: [], lastModification: new Date() };
        const payload: GameEventPayload<Question> = { pin: stubData.pin1, data: question };
        socketServerMock.emit(stubData.nextQuestionEventName, payload);

        expect(stubData.callback).toHaveBeenCalledWith(question);
    });

    it('should subscribe to nextQuestion event and not call the callback if pin does not match', () => {
        gameService.onNextQuestion(stubData.pin1, stubData.callback);
        const question: Question = { _id: '', text: 'What is 2+2', type: QuestionType.QCM, points: 100, choices: [], lastModification: new Date() };
        const payload: GameEventPayload<Question> = { pin: stubData.pin2, data: question };
        socketServerMock.emit(stubData.nextQuestionEventName, payload);

        expect(stubData.callback).not.toHaveBeenCalled();
    });

    it('should raise toggleGameLock event', () => {
        gameService.toggleGameLock(stubData.pin1);
        expect(webSocketServiceSpy.emit).toHaveBeenCalledWith(stubData.toggleGameLockEventName, { pin: stubData.pin1 });
    });

    it('should subscribe to toggleGameLock event and call the callback if pin matches', () => {
        gameService.onToggleGameLock(stubData.pin1, stubData.callback);
        const gameState: GameState = GameState.Closed;
        const payload: GameEventPayload<GameState> = { pin: stubData.pin1, data: gameState };
        socketServerMock.emit(stubData.toggleGameLockEventName, payload);

        expect(stubData.callback).toHaveBeenCalledWith(gameState);
    });

    it('should subscribe to toggleGameLock event and not call the callback if pin does not match', () => {
        gameService.onToggleGameLock(stubData.pin1, stubData.callback);
        const gameState: GameState = GameState.Closed;
        const payload: GameEventPayload<GameState> = { pin: stubData.pin2, data: gameState };
        socketServerMock.emit(stubData.toggleGameLockEventName, payload);

        expect(stubData.callback).not.toHaveBeenCalled();
    });

    it('should raise qrlInputChange event', () => {
        const isTyping = false;
        gameService.qrlInputChange(stubData.pin1, isTyping);
        expect(webSocketServiceSpy.emit).toHaveBeenCalledWith(stubData.qrlInputChangeEventName, { pin: stubData.pin1, isTyping });
    });

    it('should subscribe to qrlInputChange event and call the callback if pin matches', () => {
        gameService.onQrlInputChange(stubData.pin1, stubData.callback);

        const activePlayers: boolean[] = [];
        const payload: GameEventPayload<boolean[]> = { pin: stubData.pin1, data: activePlayers };
        socketServerMock.emit(stubData.qrlInputChangeEventName, payload);

        expect(stubData.callback).toHaveBeenCalledWith(activePlayers);
    });

    it('should subscribe to qrlInputChange event and not call the callback if pin does not match', () => {
        gameService.onQrlInputChange(stubData.pin1, stubData.callback);

        const activePlayers: boolean[] = [];
        const payload: GameEventPayload<boolean[]> = { pin: stubData.pin2, data: activePlayers };
        socketServerMock.emit(stubData.qrlInputChangeEventName, payload);

        expect(stubData.callback).not.toHaveBeenCalled();
    });

    it('should raise qrlSubmit event', () => {
        const answer = 'answer';
        gameService.qrlSubmit(stubData.pin1, answer);
        expect(webSocketServiceSpy.emit).toHaveBeenCalledWith(stubData.qrlSubmitEventName, { pin: stubData.pin1, answer });
    });

    it('should subscribe to qrlSubmit event and call the callback if pin matches', () => {
        gameService.onQrlSubmit(stubData.pin1, stubData.callback);

        const submission: QrlSubmission = { answer: 'answer', clientId: 'client' };
        const payload: GameEventPayload<QrlSubmission> = { pin: stubData.pin1, data: submission };
        socketServerMock.emit(stubData.qrlSubmitEventName, payload);

        expect(stubData.callback).toHaveBeenCalledWith(submission);
    });

    it('should subscribe to qrlSubmit event and not call the callback if pin does not match', () => {
        gameService.onQrlSubmit(stubData.pin1, stubData.callback);

        const submission: QrlSubmission = { answer: 'answer', clientId: 'client' };
        const payload: GameEventPayload<QrlSubmission> = { pin: stubData.pin2, data: submission };
        socketServerMock.emit(stubData.qrlSubmitEventName, payload);

        expect(stubData.callback).not.toHaveBeenCalled();
    });

    it('should raise qrlEvaluate event', () => {
        const socketId = 'id';
        const grade = Grade.Good;
        gameService.qrlEvaluate(socketId, stubData.pin1, grade);
        expect(webSocketServiceSpy.emit).toHaveBeenCalledWith(stubData.qrlEvaluateEventName, { socketId, pin: stubData.pin1, grade });
    });

    it('should subscribe to qrlEvaluate event and call the callback if pin matches', () => {
        gameService.onQrlEvaluate(stubData.pin1, stubData.callback);

        const evaluation: QrlEvaluation = { player: firstPlayerStub(), grade: Grade.Good, isLast: true };
        const payload: GameEventPayload<QrlEvaluation> = { pin: stubData.pin1, data: evaluation };
        socketServerMock.emit(stubData.qrlEvaluateEventName, payload);

        expect(stubData.callback).toHaveBeenCalledWith(evaluation);
    });

    it('should subscribe to qrlSubmit event and not call the callback if pin does not match', () => {
        gameService.onQrlEvaluate(stubData.pin1, stubData.callback);

        const evaluation: QrlEvaluation = { player: firstPlayerStub(), grade: Grade.Good, isLast: true };
        const payload: GameEventPayload<QrlEvaluation> = { pin: stubData.pin2, data: evaluation };
        socketServerMock.emit(stubData.qrlEvaluateEventName, payload);

        expect(stubData.callback).not.toHaveBeenCalled();
    });
});
