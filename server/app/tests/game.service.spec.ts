/* eslint-disable max-lines */ // to many lines because of many mocks that i had to clear and recreate.
/* eslint-disable @typescript-eslint/no-explicit-any */ // used for mocking the socket for instance.
import { Game } from '@app/classes/game';
import { Timer } from '@app/classes/timer';
import { CONSTANTS } from '@app/constants/constants';
import * as PinHelper from '@app/helpers/pin';
import { GameService } from '@app/services/game/game.service';
import { QuestionService } from '@app/services/question/question.service';
import { QuizService } from '@app/services/quiz/quiz.service';
import { TimerService } from '@app/services/timer/timer.service';
import { GameState } from '@common/game-state';
import { Grade } from '@common/grade';
import { QcmSubmission } from '@common/qcm-submission';
import { QuestionPayload } from '@common/question-payload';
import { ModuleRef } from '@nestjs/core';
import { Subscription } from 'rxjs';
import { Socket } from 'socket.io';
import { clientPlayerStub } from './stubs/client.player.stub';
import { evaluationStub } from './stubs/evaluation.stubs';
import { gameStub } from './stubs/game.stub';
import { playerstub } from './stubs/player.stub';
import { qrlSubmissionStub } from './stubs/qrl.submission.stub';
import { questionStub } from './stubs/question.stubs';
import { quizStub } from './stubs/quiz.stubs';
import { submissionStub } from './stubs/submission.stub';
import { PlayerState } from '@common/player-state';
import { Player } from '@common/player';
import { QuestionType } from '@common/question-type';

describe('GameService', () => {
    let gameService: GameService;
    let quizServiceMock: jest.Mocked<QuizService>;
    let questionServiceMock: jest.Mocked<QuestionService>;
    let timerServiceMock: jest.Mocked<TimerService>;
    let moduleRefMock: jest.Mocked<ModuleRef>;
    let socketMock: jest.Mocked<Socket>;

    beforeEach(async () => {
        quizServiceMock = {
            getQuizById: jest.fn(),
        } as any;

        questionServiceMock = {
            getAllQuestions: jest.fn(),
        } as any;

        timerServiceMock = {
            getTimer: jest.fn(),
        } as any;

        moduleRefMock = {
            get: jest.fn(),
        } as any;

        moduleRefMock.get.mockImplementation((provider: any) => {
            switch (provider) {
                case TimerService: {
                    return timerServiceMock;
                }
                case QuizService: {
                    return quizServiceMock;
                }
                case QuestionService: {
                    return questionServiceMock;
                }
            }
            throw new Error(`Unknown provider: ${provider}`);
        });

        gameService = new GameService(moduleRefMock);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    afterAll(() => {
        gameService.onModuleDestroy();
    });

    it('should be defined', async () => {
        expect(gameService).toBeDefined();
    });

    describe('onModuleInit', () => {
        it('should initialize clearInactiveGamesInterval onModuleInit', () => {
            const setIntervalSpy = jest.spyOn(global, 'setInterval').mockReturnValue({} as NodeJS.Timer);

            gameService.onModuleInit();

            expect(setIntervalSpy).toHaveBeenCalled();
        });
    });

    describe('getGame', () => {
        it('should return the game if it exists', () => {
            const game = gameStub();
            jest.spyOn(Map.prototype, 'get').mockReturnValue(game);
            const result = gameService.getGame(game.pin);
            expect(result.pin).toEqual(game.pin);
        });
        it('should return throw an error if the game doesnt exist', () => {
            const randomPin = 'gamePin';
            jest.spyOn(Map.prototype, 'get').mockReturnValue(null);
            expect(() => gameService.getGame(randomPin)).toThrow(`Aucune partie ne correspond au pin ${randomPin}`);
        });
    });

    describe('createGame', () => {
        it('should create a game if Quiz exist', async () => {
            const quizId = 'someQuizId';
            const quizExist = quizStub();
            const client = socketMock;
            jest.spyOn(Map.prototype, 'has').mockReturnValueOnce(true);
            jest.spyOn(PinHelper, 'generateRandomPin').mockReturnValue('mockedPinValue');
            quizServiceMock.getQuizById.mockResolvedValue(quizExist);
            const result = await gameService.createGame(client, quizId);

            expect(result).toBeTruthy();
            expect(result).toEqual('mockedPinValue');
            expect(PinHelper.generateRandomPin).toHaveBeenCalled();
            expect(gameService.getGame(result)).toBeDefined();
        });

        it('should reject if Quiz doesnt exist', async () => {
            const quizId = 'someQuizId';
            const client = socketMock;
            quizServiceMock.getQuizById.mockResolvedValue(null);
            await expect(gameService.createGame(client, quizId)).rejects.toThrow(`Aucun quiz ne correspond a l'identifiant ${quizId}`);
        });

        it('should throw an error for the random mode if there is not enought question in the question bank', async () => {
            const quizId = null;
            const client = socketMock;
            questionServiceMock.getAllQuestions.mockResolvedValue(questionStub());
            await expect(gameService.createGame(client, quizId)).rejects.toThrow(
                "Il n'existe pas assez de questions de type QCM dans la banque de questions pour faire une partie en mode aléatoire",
            );
        });

        it('should create a game in random mode if quizId is not provided', async () => {
            const qcmQuestions = [questionStub()[0], questionStub()[0], questionStub()[0], questionStub()[0], questionStub()[0]];

            questionServiceMock.getAllQuestions.mockResolvedValue(qcmQuestions);

            const result = await gameService.createGame(socketMock, null);

            expect(result).toBeDefined();
            expect(result).toEqual(expect.any(String));
            expect(gameService.games.has(result)).toBeTruthy();

            const createdGame = gameService.games.get(result);
            expect(createdGame.quiz.title).toEqual('Mode Aléatoire');
            expect(createdGame.quiz.questions.length).toBeLessThanOrEqual(CONSTANTS.randomQuestionCount);
        });
    });

    describe('joinGame', () => {
        const gameTest = gameStub();
        gameTest.state = GameState.Opened;
        gameTest.clientPlayers.clear();
        const player = playerstub();
        player.socketId = 'gameId';

        it('should return the right payload if succesfull', () => {
            socketMock = { id: 'gameId' } as jest.Mocked<Socket>;
            jest.spyOn(GameService.prototype, 'getGame').mockReturnValue(gameTest);
            const payload = gameService.joinGame(socketMock, gameTest.pin, player.username);
            expect(payload).toEqual(player);
        });

        it('should throw an error if the game is Closed', () => {
            gameTest.state = GameState.Closed;
            jest.spyOn(GameService.prototype, 'getGame').mockReturnValue(gameTest);
            expect(() => gameService.joinGame(socketMock, gameTest.pin, player.username)).toThrowError(`La partie ${gameTest.pin} n'est pas ouverte`);
        });

        it('should throw an error if the player username is Organisateur', () => {
            gameTest.state = GameState.Opened;
            jest.spyOn(GameService.prototype, 'getGame').mockReturnValue(gameTest);
            jest.spyOn(Map.prototype, 'has').mockReturnValue(false);
            gameTest.clientPlayers.clear();
            const playerOrganizer = 'Organisateur';
            expect(() => gameService.joinGame(socketMock, gameTest.pin, playerOrganizer)).toThrowError('Le nom "Organisateur" est réservé');
        });

        it('should throw an error if the player is already in the game', () => {
            gameTest.state = GameState.Opened;
            const playerUsername = 'anotherPlayer';
            gameTest.clientPlayers.set(socketMock.id, {
                player: { username: playerUsername, state: PlayerState.Playing } as Player,
                socket: socketMock,
            });
            jest.spyOn(GameService.prototype, 'getGame').mockReturnValue(gameTest);
            jest.spyOn(Map.prototype, 'has').mockReturnValue(true);
            expect(() => gameService.joinGame(socketMock, gameTest.pin, playerUsername)).toThrowError('Vous êtes déjà dans cette partie');
        });

        it('should throw an error if the player username is already used in the game', () => {
            const gameTestUsername = gameStub();
            gameTestUsername.state = GameState.Opened;
            jest.spyOn(Map.prototype, 'has').mockReturnValue(false);
            jest.spyOn(GameService.prototype, 'getGame').mockReturnValue(gameTestUsername);
            expect(() => gameService.joinGame(socketMock, gameTest.pin, player.username)).toThrowError(
                `Le nom d'utilisateur "${player.username}" est déjà pris`,
            );
        });

        it('should throw an error if the player is banned', () => {
            const gameTestUsername = gameStub();
            gameTestUsername.state = GameState.Opened;
            jest.spyOn(Map.prototype, 'has').mockReturnValue(false);
            jest.spyOn(Array.prototype, 'some').mockReturnValue(true);
            jest.spyOn(GameService.prototype, 'getGame').mockReturnValue(gameTestUsername);
            expect(() => gameService.joinGame(socketMock, gameTest.pin, player.username)).toThrowError(
                `Le nom d'utilisateur "${player.username}" est banni`,
            );
        });
    });

    describe('evaluateChoices', () => {
        const game = gameStub();
        const submission = submissionStub();
        const evaluation = evaluationStub();
        const clientPlayer = clientPlayerStub();
        it('should throw an error if the submission is final', () => {
            jest.spyOn(GameService.prototype, 'getGame').mockReturnValue(game);
            jest.spyOn<any, string>(GameService.prototype, 'getOrCreateSubmission').mockReturnValue(submission);
            expect(() => gameService.evaluateChoices(socketMock, game.pin)).toThrow('Vous avez déjà soumis vos choix pour cette question');
        });

        it('should return the right payload', () => {
            submission.isFinal = false;
            evaluation.score = 120;
            evaluation.isLast = true;
            evaluation.player.speedAwardCount = 1;
            evaluation.player.score = 120;
            jest.spyOn(GameService.prototype, 'getGame').mockReturnValue(game);
            jest.spyOn<any, string>(GameService.prototype, 'getOrCreateSubmission').mockReturnValue(submission);
            jest.spyOn<any, string>(GameService.prototype, 'isGoodAnswer').mockReturnValue(true);
            timerServiceMock.getTimer.mockReturnValue({ time: 1 } as Timer);
            jest.spyOn(game['clientPlayers'], 'get').mockReturnValue(clientPlayer);
            const result = gameService.evaluateChoices(socketMock, game.pin);
            expect(result).toEqual(evaluation);
        });

        it('should not give bonus points if time is zero', () => {
            submission.isFinal = false;
            jest.spyOn(GameService.prototype, 'getGame').mockReturnValue(game);
            jest.spyOn<any, string>(GameService.prototype, 'getOrCreateSubmission').mockReturnValue(submission);
            jest.spyOn<any, string>(GameService.prototype, 'isGoodAnswer').mockReturnValue(true);
            timerServiceMock.getTimer.mockReturnValue({ time: 0 } as Timer);
            jest.spyOn(game['clientPlayers'], 'get').mockReturnValue(clientPlayer);
            const result = gameService.evaluateChoices(socketMock, game.pin);
            expect(result.isFirstCorrect).toEqual(false);
        });

        it('should return undefined if current question is not QCM type', () => {
            jest.spyOn(GameService.prototype, 'getGame').mockReturnValue(game);
            game.quiz.questions[0].type = QuestionType.QRL;
            game.currentQuestionIndex = 0; // Assuming first question is not QCM
            expect(() => gameService.evaluateChoices(socketMock, 'testPin')).toThrowError("La question n'est pas de type QCM");
        });
    });

    describe('cancelGame', () => {
        const game = gameStub();
        socketMock = { id: 'OrganizerId' } as jest.Mocked<Socket>;
        it('should throw an error if the client is not the organizer', () => {
            jest.spyOn(GameService.prototype, 'getGame').mockReturnValue(game);
            jest.spyOn(GameService.prototype, 'isOrganizer').mockReturnValue(false);
            expect(() => gameService.cancelGame(socketMock, game.pin)).toThrowError(`Vous n'êtes pas organisateur de la partie ${game.pin}`);
        });

        it('should return the right string if organizer canceled the game', () => {
            jest.spyOn(GameService.prototype, 'getGame').mockReturnValue(game);
            jest.spyOn(GameService.prototype, 'isOrganizer').mockReturnValue(true);
            jest.spyOn(Array.prototype, 'some').mockReturnValue(true);
            const result = gameService.cancelGame(socketMock, game.pin);
            expect(result).toEqual("L'organisateur a quitté la partie");
        });

        it('should return the right string if no player left in the game', () => {
            jest.spyOn(GameService.prototype, 'getGame').mockReturnValue(game);
            jest.spyOn(GameService.prototype, 'isOrganizer').mockReturnValue(true);
            jest.spyOn(Array.prototype, 'some').mockReturnValue(false);
            const result = gameService.cancelGame(socketMock, game.pin);
            expect(result).toEqual('Tous les joueurs ont quitté la partie');
        });
    });

    describe('toggleGameLock', () => {
        const game = gameStub();
        socketMock = { id: 'OrganizerId' } as jest.Mocked<Socket>;
        it('should throw an error if the client is not the organizer ', () => {
            jest.spyOn(GameService.prototype, 'getGame').mockReturnValue(game);
            jest.spyOn(GameService.prototype, 'isOrganizer').mockReturnValue(false);
            expect(() => gameService.toggleGameLock(socketMock, game.pin)).toThrowError(`Vous n'êtes pas organisateur de la partie ${game.pin}`);
        });
        it('game should switch to closed state if current state is opened', () => {
            game.state = GameState.Opened;
            jest.spyOn(GameService.prototype, 'getGame').mockReturnValue(game);
            jest.spyOn(GameService.prototype, 'isOrganizer').mockReturnValue(true);
            expect(gameService.toggleGameLock(socketMock, game.pin)).toEqual(GameState.Closed);
        });

        it('game should switch to opened state if current state is closed', () => {
            game.state = GameState.Closed;
            jest.spyOn(GameService.prototype, 'getGame').mockReturnValue(game);
            jest.spyOn(GameService.prototype, 'isOrganizer').mockReturnValue(true);
            expect(gameService.toggleGameLock(socketMock, game.pin)).toEqual(GameState.Opened);
        });

        it('game should throw an error if game.state cannot be changed', () => {
            game.state = GameState.Running;
            jest.spyOn(GameService.prototype, 'getGame').mockReturnValue(game);
            jest.spyOn(GameService.prototype, 'isOrganizer').mockReturnValue(true);
            expect(() => gameService.toggleGameLock(socketMock, game.pin)).toThrowError('La partie ne peut pas être verouillée/déverouillée');
        });
    });

    describe('nextQuestion', () => {
        socketMock = { id: 'OrganizerId' } as jest.Mocked<Socket>;
        it('should throw an error if the client is not the organizer', () => {
            const game = gameStub();
            jest.spyOn(GameService.prototype, 'getGame').mockReturnValue(game);
            jest.spyOn(GameService.prototype, 'isOrganizer').mockReturnValue(false);
            expect(() => gameService.nextQuestion(socketMock, game.pin)).toThrowError(`Vous n'êtes pas organisateur de la partie ${game.pin}`);
        });

        it('should return the question associated to the next index', () => {
            const game = gameStub();
            const questionPayloadTest: QuestionPayload = {
                question: questionStub()[1] as any,
                isLast: true,
            };
            jest.spyOn(GameService.prototype, 'getGame').mockReturnValue(game);
            jest.spyOn(GameService.prototype, 'isOrganizer').mockReturnValue(true);
            const result = gameService.nextQuestion(socketMock, game.pin);
            expect(result).toEqual(questionPayloadTest);
        });
    });

    describe('disconnect', () => {
        const game = gameStub();
        const disconnectPayloadTest = [game.pin];

        const organizerSocket = { id: 'organizerId' } as any;
        it('should push the games to toCancel if Organizer', () => {
            game.state = GameState.Opened;
            gameService.games.set(game.pin, game);
            const result = gameService.disconnect(organizerSocket);
            gameService.games.clear();
            expect(result).toEqual(disconnectPayloadTest);
        });
    });

    describe('getOrganizer', () => {
        const game = gameStub();
        it('should return the organizer', () => {
            jest.spyOn(Map.prototype, 'get').mockReturnValue(game);
            const result = gameService.getOrganizer(game.pin);
            expect(result).toEqual(game.organizer);
        });

        it("should throw an error if game doesn't exist", () => {
            expect(() => gameService.getOrganizer(game.pin)).toThrow(`Aucune partie ne correspond au pin ${game.pin}`);
        });
    });

    describe('isOrganiser', () => {
        const game = gameStub();
        const socketOrganizerTrue = 'organizerId';
        const socketOrganizerFalse = 'no';
        it('should return true if the client is the organizer', () => {
            const result = gameService.isOrganizer(game, socketOrganizerTrue);
            expect(result).toEqual(true);
        });
        it('should return false if the client is not the organizer', () => {
            const organizerFalse: Socket = { id: 'dqlkdjqdlq' } as any;
            game.organizer = organizerFalse;
            const result = gameService.isOrganizer(game, socketOrganizerFalse);
            expect(result).toEqual(false);
        });
    });

    describe('isGoodAnswer', () => {
        const question = questionStub()[0];
        it('should return true if correct', () => {
            const submission = submissionStub();
            submission.choices[3].isSelected = true;
            submission.choices[0].isSelected = false;
            const result = gameService['isGoodAnswer'](question, submission);
            expect(result).toEqual(true);
        });
        it('should return false if incorrect', () => {
            const submission = submissionStub();
            submission.choices[3].isSelected = false;
            const result = gameService['isGoodAnswer'](question, submission);
            expect(result).toEqual(false);
        });
    });

    describe('getOrCreateSubmission', () => {
        const game = gameStub();
        const socketMockPlayer: Socket = { id: 'playerId' } as any;
        it("should create a new submission if it doesn't exist already", () => {
            const submission = submissionStub();
            submission.choices[3].isSelected = false;
            submission.isFinal = false;
            jest.spyOn(Map.prototype, 'has').mockReturnValue(false);
            const result = gameService['getOrCreateSubmission'](socketMockPlayer, game);
            expect(result).toEqual(submission);
        });

        it("should create a new submission if it doesn't exist already", () => {
            jest.spyOn(Map.prototype, 'has').mockReturnValue(true);
            const result = gameService['getOrCreateSubmission'](socketMockPlayer, game);
            expect(result).toEqual(game.currentQuestionQcmSubmissions.get(socketMockPlayer.id));
        });
    });

    describe('toggleSelectChoice', () => {
        const game = gameStub();
        const choiceIndex = 1;
        const submission: QcmSubmission = submissionStub();
        game.qcmSubmissions = [new Map<string, QcmSubmission>()];
        game.qcmSubmissions[0].set('playerId', submission);
        const submissionTest = submissionStub().choices[choiceIndex];
        submissionTest.isSelected = true;

        it('should return the right submission', () => {
            socketMock = { id: 'playerId' } as jest.Mocked<Socket>;
            const expectedResult = { clientId: socketMock.id, index: submissionTest.payload, isSelected: submissionTest.isSelected };
            jest.spyOn(GameService.prototype, 'getGame').mockReturnValue(game);
            jest.spyOn<any, string>(GameService.prototype, 'getOrCreateSubmission').mockReturnValue(submission);
            const result = gameService.qcmToggleChoice(socketMock, game.pin, choiceIndex);
            expect(result).toEqual(expectedResult);
            expect(GameService.prototype.getGame).toHaveBeenCalled();
        });
    });

    describe('endGame', () => {
        const game = gameStub();
        it('should return an error if the client is not the organizer', () => {
            jest.spyOn(GameService.prototype, 'getGame').mockReturnValue(game);
            jest.spyOn(GameService.prototype, 'isOrganizer').mockReturnValue(false);
            expect(() => gameService.endGame(socketMock, game.pin)).toThrow(`Vous n'êtes pas organisateur de la partie ${game.pin}`);
        });

        it('should change the Gamestate to Ended', () => {
            jest.spyOn(GameService.prototype, 'getGame').mockReturnValue(game);
            jest.spyOn(GameService.prototype, 'isOrganizer').mockReturnValue(true);
            gameService.endGame(socketMock, game.pin);
            expect(game.state).toEqual(GameState.Ended);
        });
    });

    describe('startGame', () => {
        const game = gameStub();
        it('should throw an error if the client is not the organizer', () => {
            jest.spyOn(GameService.prototype, 'getGame').mockReturnValue(game);
            expect(() => gameService.startGame(socketMock, game.pin)).toThrow(`Vous n'êtes pas organisateur de la partie ${game.pin}`);
        });

        it('should throw an error if no player in the game', () => {
            const gameNoPlayer = gameStub();
            gameNoPlayer.clientPlayers.clear();
            jest.spyOn(GameService.prototype, 'getGame').mockReturnValue(gameNoPlayer);
            jest.spyOn(GameService.prototype, 'isOrganizer').mockReturnValue(true);
            expect(() => gameService.startGame(socketMock, game.pin)).toThrow('Vous ne pouvez pas débuter une partie sans joueurs');
        });

        it('should return currentQuestion', () => {
            const questionPayloadTest: QuestionPayload = {
                question: questionStub()[0] as any,
                isLast: false,
            };
            jest.spyOn(GameService.prototype, 'getGame').mockReturnValue(game);
            jest.spyOn(GameService.prototype, 'isOrganizer').mockReturnValue(true);
            const result = gameService.startGame(socketMock, game.pin);
            expect(result).toEqual(questionPayloadTest);
        });
    });

    describe('qrlSubmit', () => {
        const game = gameStub();
        const answer = 'hello';
        it('should throw an error if the client already submitted', () => {
            jest.spyOn(GameService.prototype, 'getGame').mockReturnValue(game);
            jest.spyOn(Map.prototype, 'has').mockReturnValue(true);
            expect(() => gameService.qrlSubmit(socketMock, game.pin, answer)).toThrow('Vous avez déjà soumis votre réponse pour cette question');
        });

        it('should return the right submission', () => {
            socketMock = { id: 'playerId' } as jest.Mocked<Socket>;
            const submission = qrlSubmissionStub();
            jest.spyOn(GameService.prototype, 'getGame').mockReturnValue(game);
            jest.spyOn(Map.prototype, 'has').mockReturnValue(false);
            const setSpy = jest.spyOn(Map.prototype, 'set');
            const result = gameService.qrlSubmit(socketMock, game.pin, answer);
            submission.isLast = true;
            expect(setSpy).toHaveBeenCalledWith(socketMock.id, submission);
            expect(result).toEqual(submission);
        });
    });

    describe('qrlInputChange', () => {
        const game = gameStub();
        const playerSocketMock = { id: 'playerId ' } as jest.Mocked<Socket>;
        const clientPlayer = clientPlayerStub();
        const clientPlayerIsTyping = clientPlayerStub();
        clientPlayerIsTyping.player.isTyping = true;
        it('should return the right result if isTyping is false', () => {
            jest.spyOn(GameService.prototype, 'getGame').mockReturnValue(game);
            jest.spyOn(Map.prototype, 'get').mockReturnValue(clientPlayer);
            const result = gameService.qrlInputChange(playerSocketMock, game.pin, false);
            expect(result).toEqual({ clientId: playerSocketMock.id, index: 0, isSelected: true });
        });

        it('should return the right result if isTyping is true', () => {
            jest.spyOn(GameService.prototype, 'getGame').mockReturnValue(game);
            jest.spyOn(Map.prototype, 'get').mockReturnValueOnce(clientPlayer).mockReturnValueOnce(clientPlayerIsTyping);
            const result = gameService.qrlInputChange(playerSocketMock, game.pin, true);
            expect(result).toEqual({ clientId: playerSocketMock.id, index: 1, isSelected: true });
        });
    });

    describe('qrlEvaluate', () => {
        const gamePin = 'testGamePin';
        const game = gameStub();

        it('should evaluate the submission and return the result', () => {
            jest.spyOn(gameService, 'getGame').mockReturnValue(game);
            const result = gameService.qrlEvaluate(socketMock.id, gamePin, Grade.Average);

            expect(result).toBeDefined();
        });
    });

    describe('onLastQcmSubmission', () => {
        const pin = 'testGamePin';
        let callbackMock: jest.Mock<void, []>;
        let subscription: Subscription;

        beforeEach(() => {
            callbackMock = jest.fn(); // Mock callback function
            subscription = gameService.onLastQcmSubmission(pin, callbackMock);
        });

        afterEach(() => {
            subscription.unsubscribe();
        });

        it('should subscribe to lastQcmSubmissionSubjects and invoke callback on event', () => {
            const subject = gameService['lastQcmSubmissionSubjects'].get(pin);
            expect(subject).toBeDefined();
            subject.next();
            expect(callbackMock).toHaveBeenCalledTimes(1);
        });

        it('should unsubscribe properly when subscription is unsubscribed', () => {
            subscription.unsubscribe();
            const subject = gameService['lastQcmSubmissionSubjects'].get(pin);
            subject.next();
            expect(callbackMock).toHaveBeenCalledTimes(0);
        });
    });

    describe('clearInactiveGames', () => {
        it('should remove ended games with no active players', () => {
            const game1 = gameStub();
            game1.state = GameState.Ended;
            game1.getActivePlayers = jest.fn().mockReturnValue([]);
            const gamesMap = new Map<string, Game>([['game1', game1]]);
            (gameService as any).games = gamesMap;
            gameService['clearInactiveGames']();
            expect((gameService as any).games.size).toBe(0);
            expect((gameService as any).games.has('game1')).toBe(false);
        });

        it('should not remove games that are not in "Ended" state', () => {
            // Mock a game with a state other than Ended
            const game = gameStub(); // Replace null with appropriate mocks
            game.state = GameState.Opened;
            game.getActivePlayers = jest.fn().mockReturnValue([]);

            // Mock the Map entries to simulate games stored in the service
            const gamesMap = new Map<string, Game>([['game3', game]]);

            // Assign the mocked gamesMap to the service
            (gameService as any).games = gamesMap;

            // Call the method to clear inactive games
            gameService['clearInactiveGames']();

            // Expect no games to be removed because game3 is not in "Ended" state
            expect((gameService as any).games.size).toBe(1);
            expect((gameService as any).games.has('game3')).toBe(true);
        });
    });
});
