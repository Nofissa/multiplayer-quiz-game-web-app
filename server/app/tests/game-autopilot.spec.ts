import { GameAutopilot } from '@app/classes/game-autopilot';
import { ModuleRef } from '@nestjs/core';
import { GameService } from '@app/services/game/game.service';
import { TimerService } from '@app/services/timer/timer.service';
import { GameGateway } from '@app/gateways/game.gateway';
import { TimerGateway } from '@app/gateways/timer.gateway';
import { Socket } from 'socket.io';
import { TimerEventType } from '@common/timer-event-type';
import { Subject, Subscription } from 'rxjs';
import { gameStub } from './stubs/game.stub';

const QUESTION_END_DELAY_MS = 3000;
const NEXT_QUESTION_DELAY_SEC = 3;
const START_GAME_DELAY_SEC = 5;

describe('GameAutopilot', () => {
    let gameAutopilot: GameAutopilot;
    let moduleRefMock: jest.Mocked<ModuleRef>;
    let gameServiceMock: jest.Mocked<GameService>;
    let timerServiceMock: jest.Mocked<TimerService>;
    let gameGatewayMock: jest.Mocked<GameGateway>;
    let timerGatewayMock: jest.Mocked<TimerGateway>;
    let clientMock: jest.Mocked<Socket>;

    beforeEach(() => {
        moduleRefMock = {
            get: jest.fn(),
        } as never;
        moduleRefMock.get.mockImplementation((provider: never) => {
            switch (provider) {
                case GameGateway: {
                    return gameGatewayMock;
                }
                case GameService: {
                    return gameServiceMock;
                }
                case TimerGateway: {
                    return timerGatewayMock;
                }
                case TimerService: {
                    return timerServiceMock;
                }
            }
            throw new Error(`Unknown provider: ${provider}`);
        });
        gameServiceMock = {
            getGame: jest.fn(),
            onLastQcmSubmission: jest.fn(),
        } as never;
        timerServiceMock = {
            onTimeout: jest.fn(),
        } as never;
        gameGatewayMock = {
            nextQuestion: jest.fn(),
            endGame: jest.fn(),
        } as never;
        timerGatewayMock = {
            startTimer: jest.fn(),
            stopTimer: jest.fn(),
        } as never;
        clientMock = {
            on: jest.fn(),
        } as never;
        gameAutopilot = new GameAutopilot(moduleRefMock, clientMock, 'mockedPin');
    });

    afterEach(() => {
        gameAutopilot.stop();
    });

    describe('run', () => {
        it('should start the start game timer and subscribe to last QCM submission', () => {
            const timeoutSubject = new Subject<TimerEventType>();
            timerServiceMock.onTimeout.mockImplementationOnce((_pin, callback) => timeoutSubject.subscribe(callback));
            const lastQcmSubmissionSubscription = new Subject<TimerEventType>();
            gameServiceMock.onLastQcmSubmission.mockImplementationOnce((_pin, callback) => lastQcmSubmissionSubscription.subscribe(callback));

            gameAutopilot.run();

            expect(timerGatewayMock.startTimer).toHaveBeenCalledWith(clientMock, {
                pin: 'mockedPin',
                eventType: TimerEventType.StartGame,
                duration: START_GAME_DELAY_SEC,
            });
        });

        it("should start the question timer on timeout if it's StartGame or NextQuestion event type", () => {
            const timeoutSubject = new Subject<TimerEventType>();
            timerServiceMock.onTimeout.mockImplementationOnce((_pin, callback: (eventType: TimerEventType) => void) => {
                return timeoutSubject.subscribe(callback);
            });

            gameAutopilot.run();
            timeoutSubject.next(TimerEventType.StartGame);

            expect(timerGatewayMock.startTimer).toHaveBeenCalledWith(clientMock, {
                pin: 'mockedPin',
                eventType: TimerEventType.Question,
            });

            timeoutSubject.next(TimerEventType.NextQuestion);

            expect(timerGatewayMock.startTimer).toHaveBeenCalledWith(clientMock, {
                pin: 'mockedPin',
                eventType: TimerEventType.Question,
            });
        });

        it('should call nextQuestion and startTimer when game currentQuestionIndex < total questions length', () => {
            const game = gameStub();
            game.currentQuestionIndex = 0;
            const lastQcmSubmissionSubject = new Subject<void>();
            gameServiceMock.getGame.mockReturnValue(game);
            gameServiceMock.onLastQcmSubmission.mockImplementationOnce((_pin, callback: () => void) => {
                return lastQcmSubmissionSubject.subscribe(callback);
            });

            jest.useFakeTimers();
            gameAutopilot.run();
            lastQcmSubmissionSubject.next();
            jest.advanceTimersByTime(QUESTION_END_DELAY_MS);

            expect(gameGatewayMock.nextQuestion).toHaveBeenCalledWith(clientMock, { pin: 'mockedPin' });
            expect(timerGatewayMock.startTimer).toHaveBeenCalledWith(clientMock, {
                pin: 'mockedPin',
                eventType: TimerEventType.NextQuestion,
                duration: NEXT_QUESTION_DELAY_SEC,
            });
        });

        it('should call endGame and stop when game currentQuestionIndex >= total questions length', () => {
            const game = gameStub();
            game.currentQuestionIndex = game.quiz.questions.length - 1;
            const lastQcmSubmissionSubject = new Subject<void>();
            gameServiceMock.getGame.mockReturnValue(game);
            gameServiceMock.onLastQcmSubmission.mockImplementationOnce((_pin, callback: () => void) => {
                return lastQcmSubmissionSubject.subscribe(callback);
            });
            const stopSpy = jest.spyOn(gameAutopilot, 'stop');

            jest.useFakeTimers();
            gameAutopilot.run();
            lastQcmSubmissionSubject.next();
            jest.advanceTimersByTime(QUESTION_END_DELAY_MS);

            expect(gameGatewayMock.endGame).toHaveBeenCalledWith(clientMock, { pin: 'mockedPin' });
            expect(stopSpy).toHaveBeenCalled();
        });
    });

    describe('stop', () => {
        it('should unsubscribe from timeout and last QCM submission', () => {
            const timeoutSubscriptionMock = { unsubscribe: jest.fn() } as never as Subscription;
            const lastQcmSubmissionSubscriptionMock = { unsubscribe: jest.fn() } as never as Subscription;
            gameAutopilot['timeoutSubscription'] = timeoutSubscriptionMock;
            gameAutopilot['lastQcmSubmissionSubscription'] = lastQcmSubmissionSubscriptionMock;

            gameAutopilot.stop();

            expect(timeoutSubscriptionMock.unsubscribe).toHaveBeenCalled();
            expect(lastQcmSubmissionSubscriptionMock.unsubscribe).toHaveBeenCalled();
        });
    });
});
