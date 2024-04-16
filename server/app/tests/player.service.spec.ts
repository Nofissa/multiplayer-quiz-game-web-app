/* eslint-disable @typescript-eslint/no-explicit-any */
import { ClientPlayer } from '@app/classes/client-player';
import { GameService } from '@app/services/game/game.service';
import { PlayerService } from '@app/services/player/player.service';
import { PlayerState } from '@common/player-state';
import { Socket } from 'socket.io';
import { gameStub } from './stubs/game.stub';
import { playerstub } from './stubs/player.stub';

describe('playerService', () => {
    let playerService: PlayerService;
    let gameService: jest.Mocked<GameService>;

    beforeEach(() => {
        gameService = {
            getGame: jest.fn(),
            isOrganizer: jest.fn(),
        } as any;
        playerService = new PlayerService(gameService);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should be describe', () => {
        expect(playerService).toBeDefined();
    });

    describe('playerBan', () => {
        const game = gameStub();
        const socketMock = { id: 'OrganizerId' } as jest.Mocked<Socket>;
        const player = playerstub();
        player.socketId = 'playerId';
        it('should throw an error if the client is not the organizer', () => {
            gameService.getGame.mockReturnValue(game);
            gameService.isOrganizer.mockReturnValue(false);
            expect(() => playerService.playerBan(socketMock, game.pin, player.username)).toThrowError(
                `Vous n'êtes pas organisateur de la partie ${game.pin}`,
            );
        });

        it('should return undefined if no player matched in the clientPlayer', () => {
            gameService.getGame.mockReturnValue(game);
            gameService.isOrganizer.mockReturnValue(true);
            jest.spyOn(Array.prototype, 'find').mockReturnValue(undefined);

            const result = playerService.playerBan(socketMock, game.pin, player.username);
            expect(result).toEqual(null);
        });

        it('should return the client player with playerState set on Banned', () => {
            const playerBanned = playerstub();
            playerBanned.state = PlayerState.Banned;
            const clientPLayerTest: ClientPlayer = {
                socket: { id: 'playerId' } as any,
                player: playerBanned,
            };
            gameService.getGame.mockReturnValue(game);
            gameService.isOrganizer.mockReturnValue(true);
            const result = playerService.playerBan(socketMock, game.pin, player.username);
            expect(result).toEqual(clientPLayerTest);
        });
    });

    describe('playerAbandon', () => {
        const game = gameStub();
        const playerId = 'playerId';
        const player = playerstub();
        player.state = PlayerState.Abandonned;
        const socketMock = { id: 'playerId' } as jest.Mocked<Socket>;
        it('should return the clientPlayer of the player who has abandoned', () => {
            const clientPlayerTest = {
                socket: { id: playerId } as any,
                player,
            };
            gameService.getGame.mockReturnValue(game);
            jest.spyOn(Map.prototype, 'get').mockReturnValue(clientPlayerTest);
            const result = playerService.playerAbandon(socketMock, game.pin);
            expect(result).toEqual(clientPlayerTest);
        });

        it('should return null if no clientPlayer', () => {
            gameService.getGame.mockReturnValue(game);
            jest.spyOn(Map.prototype, 'get').mockReturnValue(null);
            const result = playerService.playerAbandon(socketMock, game.pin);
            expect(result).toEqual(null);
        });
    });

    describe('playerMute', () => {
        const game = gameStub();
        const socketMock = { id: 'OrganizerId' } as jest.Mocked<Socket>;
        const player = playerstub();
        player.socketId = 'playerId';
        it('should throw an error if the client is not the organizer', () => {
            gameService.getGame.mockReturnValue(game);
            gameService.isOrganizer.mockReturnValue(false);
            expect(() => playerService.playerMute(socketMock, game.pin, player.username)).toThrowError(
                `Vous n'êtes pas organisateur de la partie ${game.pin}`,
            );
        });

        it('should return undefined if no player matched in the clientPlayer', () => {
            gameService.getGame.mockReturnValue(game);
            gameService.isOrganizer.mockReturnValue(true);
            jest.spyOn(Array.prototype, 'find').mockReturnValue(undefined);

            const result = playerService.playerMute(socketMock, game.pin, player.username);
            expect(result).toEqual(undefined);
        });

        it('should return the client player with playerState set on Muted', () => {
            const playerMuted = playerstub();
            playerMuted.isMuted = true;
            const clientPLayerTest: ClientPlayer = {
                socket: { id: 'playerId' } as any,
                player: playerMuted,
            };
            gameService.getGame.mockReturnValue(game);
            gameService.isOrganizer.mockReturnValue(true);
            const result = playerService.playerMute(socketMock, game.pin, player.username);
            expect(result).toEqual(clientPLayerTest);
        });
    });

    describe('disconnect', () => {
        it('should return the right array', () => {
            const game = gameStub();
            gameService.games = new Map();
            gameService.games.set(game.pin, game);
            const result = playerService.disconnect(game.clientPlayers.get('playerId').socket);
            expect(result).toEqual(['1234']);
        });
    });
});
