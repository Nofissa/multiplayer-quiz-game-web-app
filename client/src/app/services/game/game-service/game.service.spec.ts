import { TestBed } from '@angular/core/testing';
import { SocketServerMock } from '@app/mocks/socket-server-mock';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { Evaluation } from '@common/evaluation';
import { GameEventPayload } from '@common/game-event-payload';
import { GameState } from '@common/game-state';
import { Question } from '@common/question';
import { Submission } from '@common/submission';
import { Observable } from 'rxjs';
import { io } from 'socket.io-client';
import { GameService } from './game.service';

describe('GameService', () => {
    let gameService: GameService;
    let webSocketServiceSpy: jasmine.SpyObj<WebSocketService>;
    let socketServerMock: SocketServerMock;
    const stubData = {
        pin1: '1234',
        pin2: '4321',
        createGameEventName: 'createGame',
        joinGameEventName: 'joinGame',
        cancelGameEventName: 'cancelGame',
        playerAbandonEventName: 'playerAbandon',
        playerBanEventName: 'playerBan',
        toggleSelectChoiceEventName: 'toggleSelectChoice',
        submitChoicesEventName: 'submitChoices',
        getCurrentQuestionEventName: 'getCurrentQuestion',
        nextQuestionEventName: 'nextQuestion',
        toggleGameLockEventName: 'toggleGameLock',
        callback: jasmine.createSpy('callback'),
    };

    beforeEach(() => {
        webSocketServiceSpy = jasmine.createSpyObj('WebSocketService', ['emit', 'on'], {
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

    it('should raise joinGame event', () => {
        const username = 'user123';
        gameService.joinGame(stubData.pin1, username);

        expect(webSocketServiceSpy.emit).toHaveBeenCalledWith(stubData.joinGameEventName, { pin: stubData.pin1, username });
    });

    // it('should subscribe to joinGame event and call the callback if pin matches', () => {
    //     gameService.onJoinGame(stubData.pin1, stubData.callback);

    //     const player: Player = {} as Player;
    //     const payload: GameEventPayload<Player> = { pin: stubData.pin1, data: player };
    //     socketServerMock.emit(stubData.joinGameEventName, payload);

    //     expect(stubData.callback).toHaveBeenCalledWith(payload);
    // });

    // it('should subscribe to joinGame event and not call the callback if pin does not match', () => {
    //     gameService.onJoinGame(stubData.pin1, stubData.callback);

    // const player: Player = {} as Player;
    // const payload: GameEventPayload<Player> = { pin: stubData.pin1, data: player };
    // socketServerMock.emit(stubData.joinGameEventName, payload);

    //     expect(stubData.callback).not.toHaveBeenCalled();
    // });

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

    it('should raise playerAbandon event', () => {
        gameService.playerAbandon(stubData.pin1);
        expect(webSocketServiceSpy.emit).toHaveBeenCalledWith(stubData.playerAbandonEventName, { pin: stubData.pin1 });
    });

    // it('should subscribe to playerAbandon event and call the callback if pin matches', () => {
    //     gameService.onPlayerAbandon(stubData.pin1, stubData.callback);

    // const player: Player = {} as Player;
    // const payload: GameEventPayload<Player> = { pin: stubData.pin1, data: player };
    // socketServerMock.emit(stubData.playerAbandonEventName, payload);

    //     expect(stubData.callback).toHaveBeenCalledWith(player);
    // });

    // it('should subscribe to playerAbandon event and not call the callback if does not match', () => {
    //     gameService.onPlayerAbandon(stubData.pin1, stubData.callback);

    // const player: Player = {} as Player;
    // const payload: GameEventPayload<Player> = { pin: stubData.pin2, data: player };
    // socketServerMock.emit(stubData.playerAbandonEventName, payload);

    //     expect(stubData.callback).not.toHaveBeenCalled();
    // });

    it('should raise playerBan event', () => {
        const username = 'user123';
        gameService.playerBan(stubData.pin1, username);
        expect(webSocketServiceSpy.emit).toHaveBeenCalledWith(stubData.playerBanEventName, { pin: stubData.pin1, username });
    });

    // it('should subscribe to playerBan event and call the callback if pin matches', () => {
    //     gameService.onPlayerBan(stubData.pin1, stubData.callback);

    // const player: Player = {} as Player;
    // const payload: GameEventPayload<Player> = { pin: stubData.pin1, data: player };
    // socketServerMock.emit('playerBan', payload);

    //     expect(stubData.callback).toHaveBeenCalledWith(player);
    // });

    // it('should subscribe to playerBan event and not call the callback if pin does not match', () => {
    //     gameService.onPlayerBan(stubData.pin1, stubData.callback);

    // const player: Player = {} as Player;
    // const payload: GameEventPayload<Player> = { pin: stubData.pin2, data: player };
    // socketServerMock.emit('playerBan', payload);

    //     expect(stubData.callback).not.toHaveBeenCalled();
    // });

    it('should raise toggleSelectChoice event', () => {
        const choiceIndex = 2;
        gameService.toggleSelectChoice(stubData.pin1, choiceIndex);

        expect(webSocketServiceSpy.emit).toHaveBeenCalledWith(stubData.toggleSelectChoiceEventName, { pin: stubData.pin1, choiceIndex });
    });

    it('should subscribe to toggleSelectChoice event and call the callback if pin matches', () => {
        gameService.onToggleSelectChoice(stubData.pin1, stubData.callback);

        const submission: Submission = { choices: [], isFinal: false };
        const payload: GameEventPayload<Submission> = { pin: stubData.pin1, data: submission };
        socketServerMock.emit(stubData.toggleSelectChoiceEventName, payload);

        expect(stubData.callback).toHaveBeenCalledWith(submission);
    });

    it('should subscribe to toggleSelectChoice event and not call the callback if pin does not match', () => {
        gameService.onToggleSelectChoice(stubData.pin1, stubData.callback);

        const submission: Submission = { choices: [], isFinal: false };
        const payload: GameEventPayload<Submission> = { pin: stubData.pin2, data: submission };
        socketServerMock.emit(stubData.toggleSelectChoiceEventName, payload);

        expect(stubData.callback).not.toHaveBeenCalled();
    });

    it('should raise submitChoices event', () => {
        gameService.submitChoices(stubData.pin1);
        expect(webSocketServiceSpy.emit).toHaveBeenCalledWith(stubData.submitChoicesEventName, { pin: stubData.pin1 });
    });

    it('should subscribe to submitChoices event and call the callback if pin matches', () => {
        gameService.onSubmitChoices(stubData.pin1, stubData.callback);
        const evaluation: Evaluation = {} as Evaluation;
        const payload: GameEventPayload<Evaluation> = { pin: stubData.pin1, data: evaluation };
        socketServerMock.emit(stubData.submitChoicesEventName, payload);

        expect(stubData.callback).toHaveBeenCalledWith(evaluation);
    });

    it('should subscribe to submitChoices event and not call the callback if pin does not match', () => {
        gameService.onSubmitChoices(stubData.pin1, stubData.callback);
        const evaluation: Evaluation = {} as Evaluation;
        const payload: GameEventPayload<Evaluation> = { pin: stubData.pin2, data: evaluation };
        socketServerMock.emit(stubData.submitChoicesEventName, payload);

        expect(stubData.callback).not.toHaveBeenCalled();
    });

    it('should raise nextQuestion event', () => {
        gameService.nextQuestion(stubData.pin1);
        expect(webSocketServiceSpy.emit).toHaveBeenCalledWith(stubData.nextQuestionEventName, { pin: stubData.pin1 });
    });

    it('should subscribe to nextQuestion event and call the callback if pin matches', () => {
        gameService.onNextQuestion(stubData.pin1, stubData.callback);
        const question: Question = { _id: '', text: 'What is 2+2', type: 'QCM', points: 100, choices: [], lastModification: new Date() };
        const payload: GameEventPayload<Question> = { pin: stubData.pin1, data: question };
        socketServerMock.emit(stubData.nextQuestionEventName, payload);

        expect(stubData.callback).toHaveBeenCalledWith(question);
    });

    it('should subscribe to nextQuestion event and not call the callback if pin does not match', () => {
        gameService.onNextQuestion(stubData.pin1, stubData.callback);
        const question: Question = { _id: '', text: 'What is 2+2', type: 'QCM', points: 100, choices: [], lastModification: new Date() };
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
});
