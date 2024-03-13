/* eslint-disable @typescript-eslint/no-explicit-any */
import { ClientPlayer } from '@app/classes/client-player';
import * as PinHelper from '@app/helpers/pin';
import { GameService } from '@app/services/game/game.service';
import { QuizService } from '@app/services/quiz/quiz.service';
import { GameState } from '@common/game-state';
import { JoinGamePayload } from '@common/join-game-payload';
import { PlayerState } from '@common/player-state';
import 'reflect-metadata';
import { Socket } from 'socket.io';
import { gameStub } from './stubs/game.stub';
import { playerstub } from './stubs/player.stub';
import { quizStub } from './stubs/quiz.stubs';

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
        jest.clearAllMocks();
        Reflect.deleteMetadata('design:paramtypes', Reflect);
        Reflect.deleteMetadata('design:returntype', Reflect);
    });

    it('should be defined', async () => {
        expect(gameService).toBeDefined();
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
        const clientPlayers = Array.from(gameTest.clientPlayers.values());
        const player = playerstub();
        const payloadComparison: JoinGamePayload = {
            pin: gameTest.pin,
            players: clientPlayers.map((x) => x.player),
            chatlogs: gameTest.chatlogs,
        };
        jest.spyOn(GameService.prototype, 'getGame').mockReturnValue(gameTest);

        socketMock = { id: 'gameId' } as jest.Mocked<Socket>;
        it('should return the right payload if succesfull', () => {
            const payload = gameService.joinGame(socketMock, gameTest.pin, player.username);
            expect(payload).toEqual(payloadComparison);
        });

        it('should throw an error if the game is Closed', () => {
            gameTest.state = GameState.Closed;
            expect(() => gameService.joinGame(socketMock, gameTest.pin, player.username)).toThrowError(`La partie ${gameTest.pin} n'est pas ouverte`);
        });

        it('should throw an error if the player username is Organisateur', () => {
            gameTest.state = GameState.Opened;
            const playerOrganizer = 'Organisateur';
            expect(() => gameService.joinGame(socketMock, gameTest.pin, playerOrganizer)).toThrowError('Le nom "Organisateur" est réservé');
        });

        it('should throw an error if the player username is already used in the game', () => {
            const gameTestUsername = gameStub();
            gameTestUsername.state = GameState.Opened;
            jest.spyOn(GameService.prototype, 'getGame').mockReturnValue(gameTestUsername);
            expect(() => gameService.joinGame(socketMock, gameTest.pin, player.username)).toThrowError(
                `Le nom d'utilisateur "${player.username}" est déjà pris`,
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
                socket: socketMock,
                player: playerBanned,
            };
            jest.spyOn(GameService.prototype, 'getGame').mockReturnValue(game);
            jest.spyOn(GameService.prototype, 'isOrganizer').mockReturnValue(true);
            jest.spyOn(Array.prototype, 'find').mockReturnValue(clientPLayerTest);
            const result = gameService.playerBan(socketMock, game.pin, player.username);
            expect(result).toEqual(clientPLayerTest);
        });
    });

    describe('getGame', () => {
        const game = gameStub();
        jest.spyOn(Map.prototype, 'get').mockReturnValue(game);
        it('should return the game if it exists', () => {
            const result = gameService.getGame(game.pin);
            expect(result).toEqual(game);
        });
    });

    describe('evaluateChoices', () => {
        // TODO
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
            expect(result).toEqual('Organizor canceled the game');
        });

        it('should return the right string if no player left in the game', () => {
            jest.spyOn(GameService.prototype, 'getGame').mockReturnValue(game);
            jest.spyOn(GameService.prototype, 'isOrganizer').mockReturnValue(true);
            jest.spyOn(Array.prototype, 'some').mockReturnValue(false);
            const result = gameService.cancelGame(socketMock, game.pin);
            expect(result).toEqual('All the player left. Game has been canceled');
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
            game.state = GameState.Started;
            jest.spyOn(GameService.prototype, 'getGame').mockReturnValue(game);
            jest.spyOn(GameService.prototype, 'isOrganizer').mockReturnValue(true);
            expect(() => gameService.toggleGameLock(socketMock, game.pin)).toThrowError('La partie ne peut pas être verouillée/déverouillée');
        });
    });

    describe('nextQuestion', () => {
        const game = gameStub();
        socketMock = { id: 'OrganizerId' } as jest.Mocked<Socket>;
        it('should throw an error if the client is not the organizer', () => {
            jest.spyOn(GameService.prototype, 'getGame').mockReturnValue(game);
            jest.spyOn(GameService.prototype, 'isOrganizer').mockReturnValue(false);
            expect(() => gameService.nextQuestion(socketMock, game.pin)).toThrowError(`Vous n'êtes pas organisateur de la partie ${game.pin}`);
        });

        it('should return the question associated to the next index', () => {
            jest.spyOn(GameService.prototype, 'getGame').mockReturnValue(game);
            jest.spyOn(GameService.prototype, 'isOrganizer').mockReturnValue(true);
            const result = gameService.nextQuestion(socketMock, game.pin);
            expect(result).toEqual(game.quiz.questions[1]);
        });
    });
});
