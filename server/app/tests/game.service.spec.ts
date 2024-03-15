/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ClientPlayer } from '@app/classes/client-player';
import * as PinHelper from '@app/helpers/pin';
import { DisconnectPayload } from '@app/interfaces/disconnect-payload';
import { GameService } from '@app/services/game/game.service';
import { QuizService } from '@app/services/quiz/quiz.service';
// import { GameInitBundle } from '@common/game-init-bundle';
import { GameState } from '@common/game-state';
import { PlayerState } from '@common/player-state';
import { Socket } from 'socket.io';
import { clientPlayerStub } from './stubs/client.player.stub';
import { evaluationStub } from './stubs/evaluation.stubs';
import { gameStub } from './stubs/game.stub';
import { playerstub } from './stubs/player.stub';
import { questionStub } from './stubs/question.stubs';
import { quizStub } from './stubs/quiz.stubs';
import { submissionStub } from './stubs/submission.stub';

describe('GameService', () => {
    let gameService: GameService;
    let quizServiceMock: jest.Mocked<QuizService>;
    let socketMock: jest.Mocked<Socket>;

    beforeEach(async () => {
        quizServiceMock = {
            getQuizById: jest.fn(),
        } as any;
        socketMock = { id: 'gameId' } as jest.Mocked<Socket>;

        gameService = new GameService(quizServiceMock);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should be defined', async () => {
        expect(gameService).toBeDefined();
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
            jest.spyOn(PinHelper, 'generateRandomPin').mockReturnValue('mockedPinValue');
            quizServiceMock.getQuizById.mockResolvedValue(quizExist);
            const result = await gameService.createGame(client, quizId);

            expect(result).toBeTruthy();
            expect(result).toEqual('mockedPinValue');
            expect(gameService.getGame(result)).toBeDefined();
        });

        it('should reject if Quiz doesnt exist', async () => {
            const quizId = 'someQuizId';
            const client = socketMock;
            quizServiceMock.getQuizById.mockResolvedValue(null);
            await expect(gameService.createGame(client, quizId)).rejects.toThrow(`Aucun quiz ne correspond a l'identifiant ${quizId}`);
        });
    });

    describe('joinGame', () => {
        const gameTest = gameStub();
        gameTest.state = GameState.Opened;
        gameTest.clientPlayers.clear();
        const player = playerstub();
        player.socketId = 'gameId';

        socketMock = { id: 'gameId' } as jest.Mocked<Socket>;
        it('should return the right payload if succesfull', () => {
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
            const playerOrganizer = 'Organisateur';
            expect(() => gameService.joinGame(socketMock, gameTest.pin, playerOrganizer)).toThrowError('Le nom "Organisateur" est réservé');
        });

        it('should throw an error if the player is already in the game', () => {
            gameTest.state = GameState.Opened;
            const playerUsername = 'anotherPlayer';
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
                `Le nom d'utilisateur "${player.username}" banni`,
            );
        });
    });

    describe('playerAbandon', () => {
        const game = gameStub();
        const playerId = 'playerId';
        const player = playerstub();
        player.state = PlayerState.Abandonned;
        socketMock = { id: 'playerId' } as jest.Mocked<Socket>;
        it('should return the clientPlayer of the player who has abandoned', () => {
            const clientPlayerTest = {
                socket: { id: playerId } as any,
                player,
            };
            jest.spyOn(GameService.prototype, 'getGame').mockReturnValue(game);
            jest.spyOn(Map.prototype, 'get').mockReturnValue(clientPlayerTest);
            const result = gameService.playerAbandon(socketMock, game.pin);
            expect(result).toEqual(clientPlayerTest);
        });
    });

    describe('playerBan', () => {
        const game = gameStub();
        socketMock = { id: 'OrganizerId' } as jest.Mocked<Socket>;
        const player = playerstub();
        player.socketId = 'playerId';
        it('should throw an error if the client is not the organizer', () => {
            jest.spyOn(GameService.prototype, 'getGame').mockReturnValue(game);
            jest.spyOn(GameService.prototype, 'isOrganizer').mockReturnValue(false);
            expect(() => gameService.playerBan(socketMock, game.pin, player.username)).toThrowError(
                `Vous n'êtes pas organisateur de la partie ${game.pin}`,
            );
        });

        it('should return undefined if no player matched in the clientPlayer', () => {
            jest.spyOn(GameService.prototype, 'getGame').mockReturnValue(game);
            jest.spyOn(GameService.prototype, 'isOrganizer').mockReturnValue(true);
            jest.spyOn(Array.prototype, 'find').mockReturnValue(undefined);

            const result = gameService.playerBan(socketMock, game.pin, player.username);
            expect(result).toEqual(undefined);
        });

        it('should return the client player with playerState set on Banned', () => {
            const playerBanned = playerstub();
            playerBanned.state = PlayerState.Banned;
            const clientPLayerTest: ClientPlayer = {
                socket: { id: 'playerId' } as any,
                player: playerBanned,
            };
            jest.spyOn(GameService.prototype, 'getGame').mockReturnValue(game);
            jest.spyOn(GameService.prototype, 'isOrganizer').mockReturnValue(true);
            const result = gameService.playerBan(socketMock, game.pin, player.username);
            expect(result).toEqual(clientPLayerTest);
        });
    });

    describe('evaluateChoices', () => {
        const game = gameStub();
        const submission = submissionStub();
        const evaluation = evaluationStub();
        const clientPlayer = clientPlayerStub();
        it('should throw an error if the submission is final', () => {
            jest.spyOn(GameService.prototype, 'getGame').mockReturnValue(game);
            jest.spyOn(GameService.prototype, 'getOrCreateSubmission').mockReturnValue(submission);
            expect(() => gameService.evaluateChoices(socketMock, game.pin)).toThrow('Vous avez déjà soumis vos choix pour cette question');
        });

        it('should return the right payload', () => {
            submission.isFinal = false;
            evaluation.score = 120;
            evaluation.isLast = true;
            evaluation.player.speedAwardCount = 1;
            evaluation.player.score = 120;
            jest.spyOn(GameService.prototype, 'getGame').mockReturnValue(game);
            jest.spyOn(GameService.prototype, 'getOrCreateSubmission').mockReturnValue(submission);
            jest.spyOn(GameService.prototype, 'isGoodAnswer').mockReturnValue(true);
            jest.spyOn(Map.prototype, 'get').mockReturnValue(clientPlayer);
            const result = gameService.evaluateChoices(socketMock, game.pin);
            expect(result).toEqual(evaluation);
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
            jest.spyOn(GameService.prototype, 'getGame').mockReturnValue(game);
            jest.spyOn(GameService.prototype, 'isOrganizer').mockReturnValue(true);
            const result = gameService.nextQuestion(socketMock, game.pin);
            expect(result).toEqual(game.quiz.questions[1]);
        });
    });

    describe('disconnect', () => {
        const game = gameStub();
        const disconnectPayloadTest: DisconnectPayload = {
            toCancel: [game.pin],
            toAbandon: [],
        };

        const disconnectPayloadTestPlayer: DisconnectPayload = {
            toCancel: [],
            toAbandon: ['1234'],
        };
        const organizerSocket = { id: 'organizerId' } as any;
        it('should push the game to toCancel if Organizer', () => {
            gameService.games.set(game.pin, game);
            const result = gameService.disconnect(organizerSocket);
            gameService.games.clear();
            expect(result).toEqual(disconnectPayloadTest);
        });

        it('should push the player to toAbandon', () => {
            gameService.games.set(game.pin, game);
            const result = gameService.disconnect(game.clientPlayers.get('playerId').socket);
            expect(result).toEqual(disconnectPayloadTestPlayer);
        });
    });

    describe('getOrganizerId', () => {
        it('should return the id of the organizer', () => {
            const game = gameStub();
            jest.spyOn(GameService.prototype, 'getGame').mockReturnValue(game);
            const result = gameService.getOrganizerId(game.pin);
            expect(result).toEqual(game.organizer.id);
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
            submission.choices[3].isSelected = false;
            submission.choices[0].isSelected = true;
            const result = gameService.isGoodAnswer(question, submission);
            expect(result).toEqual(true);
        });
        it('should return false if incorrect', () => {
            const submission = submissionStub();
            submission.choices[3].isSelected = false;
            const result = gameService.isGoodAnswer(question, submission);
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
            const result = gameService.getOrCreateSubmission(socketMockPlayer, game);
            expect(result).toEqual(submission);
        });

        it("should create a new submission if it doesn't exist already", () => {
            jest.spyOn(Map.prototype, 'has').mockReturnValue(true);
            const result = gameService.getOrCreateSubmission(socketMockPlayer, game);
            expect(result).toEqual(game.currentQuestionSubmissions.get(socketMockPlayer.id));
        });
    });

    describe('toggleSelectChoice', () => {
        const game = gameStub();
        const choiceIndex = 1;
        const submission = submissionStub();
        const submissionTest = submissionStub();
        submissionTest.choices[1].isSelected = true;
        const expectedResult = { clientId: 'gameId', submission: submissionTest };

        it('should return the right submission', () => {
            jest.spyOn(GameService.prototype, 'getGame').mockReturnValue(game);
            jest.spyOn(GameService.prototype, 'getOrCreateSubmission').mockReturnValue(submission);
            const result = gameService.toggleSelectChoice(socketMock, game.pin, choiceIndex);
            expect(result).toEqual(expectedResult);
        });
    });

    describe('getGameResults', () => {
        const game = gameStub();
        it("should throw an error if game doesn't exist", () => {
            jest.spyOn(GameService.prototype, 'getGame').mockReturnValue(null);
            expect(() => gameService.getGameResults(game.pin)).toThrow(`Aucune partie ne correspond au pin ${game.pin}`);
        });

        it('should return all the game submissions', () => {
            jest.spyOn(GameService.prototype, 'getGame').mockReturnValue(game);
            const result = gameService.getGameResults(game.pin);
            expect(result).toEqual(game.allSubmissions);
        });
    });

    describe('endGame', () => {
        const game = gameStub();
        it('should return an error if the client is not the organizer', () => {
            jest.spyOn(GameService.prototype, 'getGame').mockReturnValue(game);
            jest.spyOn(GameService.prototype, 'isOrganizer').mockReturnValue(false);
            expect(() => gameService.endGame(game.pin, socketMock)).toThrow(`Vous n'êtes pas organisateur de la partie ${game.pin}`);
        });

        it('should change the state of the game to Ended', () => {
            jest.spyOn(GameService.prototype, 'getGame').mockReturnValue(game);
            jest.spyOn(GameService.prototype, 'isOrganizer').mockReturnValue(true);
            gameService.games.set(game.pin, game);
            gameService.endGame(game.pin, socketMock);
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
            jest.spyOn(GameService.prototype, 'getGame').mockReturnValue(game);
            jest.spyOn(GameService.prototype, 'isOrganizer').mockReturnValue(true);
            const result = gameService.startGame(socketMock, game.pin);
            expect(result).toEqual(game.currentQuestion);
        });
    });
});
