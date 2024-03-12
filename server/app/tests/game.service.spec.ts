/* eslint-disable @typescript-eslint/no-explicit-any */
import * as PinHelper from '@app/helpers/pin';
import { GameService } from '@app/services/game/game.service';
import { QuizService } from '@app/services/quiz/quiz.service';
import { GameState } from '@common/game-state';
import { JoinGamePayload } from '@common/join-game-payload';
import { PlayerState } from '@common/player-state';
import { Test, TestingModule } from '@nestjs/testing';
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
        const module: TestingModule = await Test.createTestingModule({
            providers: [GameService, { provide: QuizService, useValue: quizServiceMock }],
        }).compile();

        gameService = module.get<GameService>(GameService);
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
        it('should return the player who has abandoned', () => {
            const clientPlayerTest = {
                socket: { id: playerId } as any,
                player,
            };
            jest.spyOn(GameService.prototype, 'getGame').mockReturnValue(game);
            const result = gameService.playerAbandon(socketMock, game.pin);
            expect(result).toEqual(clientPlayerTest);
        });
    });
});
