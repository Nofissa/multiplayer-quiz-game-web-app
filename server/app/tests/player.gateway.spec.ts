/* eslint-disable @typescript-eslint/no-explicit-any */
import { ClientPlayer } from '@app/classes/client-player';
import { PlayerGateway } from '@app/gateways/player.gateway';
import { PlayerService } from '@app/services/player/player.service';
import { GameEventPayload } from '@common/game-event-payload';
import { Player } from '@common/player';
import { BroadcastOperator, Server, Socket } from 'socket.io';
import { playerstub } from './stubs/player.stub';

describe('PlayerGateway', () => {
    let playerGateway: PlayerGateway;
    let playerService: jest.Mocked<PlayerService>;
    let socketMock: jest.Mocked<Socket>;
    let serverMock: jest.Mocked<Server>;
    let broadcastMock: any;

    beforeEach(() => {
        playerService = {
            playerAbandon: jest.fn(),
            playerBan: jest.fn(),
            disconnect: jest.fn(),
            playerMute: jest.fn(),
        } as any;
        socketMock = {
            id: 'organizerId',
            emit: jest.fn(),
            join: jest.fn(),
            leave: jest.fn(),
        } as any;
        serverMock = {
            emit: jest.fn(),
            to: jest.fn(),
            socketsLeave: jest.fn(),
        } as any;
        broadcastMock = {
            emit: jest.fn(),
        } as any as BroadcastOperator<any, any>;
        playerGateway = new PlayerGateway(playerService);
        playerGateway.server = serverMock;
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it('should be describe', () => {
        expect(playerGateway).toBeDefined();
    });

    describe('playerBan', () => {
        const pin = 'mockPin';
        const username = 'mockUsername';
        const clientPlayer = {
            socket: { leave: jest.fn() } as any,
            player: playerstub(),
        };

        it('should handle null clientPlayer Value', () => {
            playerService.playerBan.mockReturnValue(undefined);
            const payload: GameEventPayload<Player> = { pin, data: undefined };
            serverMock.to.mockReturnValue(broadcastMock);
            playerGateway.playerBan(socketMock, { pin, username });
            expect(serverMock.to).toHaveBeenCalledWith(pin);
            expect(broadcastMock.emit).toHaveBeenCalledWith('playerBan', payload);
            expect(clientPlayer.socket.leave).toHaveBeenCalledTimes(0);
        });

        it('should handle null socket Value', () => {
            const clientPlayerNullSocket = {
                socket: {} as any,
                player: playerstub(),
            };
            playerService.playerBan.mockReturnValue(clientPlayerNullSocket);
            const payload: GameEventPayload<Player> = { pin, data: clientPlayerNullSocket.player };
            serverMock.to.mockReturnValue(broadcastMock);
            playerGateway.playerBan(socketMock, { pin, username });
            expect(serverMock.to).toHaveBeenCalledWith(pin);
            expect(broadcastMock.emit).toHaveBeenCalledWith('playerBan', payload);
            expect(clientPlayer.socket.leave).toHaveBeenCalledTimes(0);
        });

        it('should handle banning a player from the game and emit the "playerBan" event with the correct payload', () => {
            playerService.playerBan.mockReturnValue(clientPlayer);
            const payload: GameEventPayload<Player> = { pin, data: clientPlayer.player };
            serverMock.to.mockReturnValue(broadcastMock);
            playerGateway.playerBan(socketMock, { pin, username });
            expect(serverMock.to).toHaveBeenCalledWith(pin);
            expect(broadcastMock.emit).toHaveBeenCalledWith('playerBan', payload);
            expect(clientPlayer.socket.leave).toHaveBeenCalledWith(pin);
        });

        it('should throw an error if there is an issue', () => {
            playerService.playerBan.mockImplementation(() => {
                throw new Error('Mock error');
            });
            playerGateway.playerBan(socketMock, { pin, username });
            expect(socketMock.emit).toHaveBeenCalledWith('error', 'Mock error');
        });
    });

    describe('playerAbandon', () => {
        it('should handle player abandoning the game and emit the "playerAbandon" event with the correct payload', () => {
            const pin = 'mockPin';
            const clientPlayer = {
                socket: { leave: jest.fn() } as any,
                player: playerstub(),
            };
            playerService.playerAbandon.mockReturnValue(clientPlayer);
            serverMock.to.mockReturnValue(broadcastMock);
            const payload: GameEventPayload<Player> = { pin, data: clientPlayer.player };
            playerGateway.playerAbandon(socketMock, { pin });
            expect(serverMock.to).toHaveBeenCalledWith(pin);
            expect(broadcastMock.emit).toHaveBeenCalledWith('playerAbandon', payload);
            expect(clientPlayer.socket.leave).toHaveBeenCalledWith(pin);
        });

        it('should emit "error" event if an error occurs during handling player abandoning the game', () => {
            const pin = 'mockPin';
            playerService.playerAbandon.mockImplementation(() => {
                throw new Error('Mock error');
            });
            playerGateway.playerAbandon(socketMock, { pin });
            expect(socketMock.emit).toHaveBeenCalledWith('error', 'Mock error');
        });
    });

    it('should handle null clientPlayer Value', () => {
        const pin = 'mockPin';
        const clientPlayer = undefined as ClientPlayer;
        playerService.playerAbandon.mockReturnValue(clientPlayer);
        serverMock.to.mockReturnValue(broadcastMock);
        const leaveSpy = jest.spyOn(Socket.prototype, 'leave');
        const payload: GameEventPayload<Player> = { pin, data: undefined };
        playerGateway.playerAbandon(socketMock, { pin });
        expect(serverMock.to).toHaveBeenCalledWith(pin);
        expect(broadcastMock.emit).toHaveBeenCalledWith('playerAbandon', payload);
        expect(leaveSpy).toHaveBeenCalledTimes(0);
    });

    it('should handle null Socket Value', () => {
        const pin = 'mockPin';
        const clientPlayer = { socket: null as any } as ClientPlayer;
        playerService.playerAbandon.mockReturnValue(clientPlayer);
        serverMock.to.mockReturnValue(broadcastMock);
        const leaveSpy = jest.spyOn(Socket.prototype, 'leave');
        const payload: GameEventPayload<Player> = { pin, data: undefined };
        playerGateway.playerAbandon(socketMock, { pin });
        expect(serverMock.to).toHaveBeenCalledWith(pin);
        expect(broadcastMock.emit).toHaveBeenCalledWith('playerAbandon', payload);
        expect(leaveSpy).toHaveBeenCalledTimes(0);
    });

    it('should handle player abandoning the game and emit the "playerAbandon" event with the correct payload', () => {
        const pin = 'mockPin';
        const clientPlayer = {
            socket: { leave: jest.fn() } as any,
            player: playerstub(),
        };
        playerService.playerAbandon.mockReturnValue(clientPlayer);
        serverMock.to.mockReturnValue(broadcastMock);
        const payload: GameEventPayload<Player> = { pin, data: clientPlayer.player };
        playerGateway.playerAbandon(socketMock, { pin });
        expect(serverMock.to).toHaveBeenCalledWith(pin);
        expect(broadcastMock.emit).toHaveBeenCalledWith('playerAbandon', payload);
        expect(clientPlayer.socket.leave).toHaveBeenCalledWith(pin);
    });

    it('should emit "error" event if an error occurs during handling player abandoning the game', () => {
        const pin = 'mockPin';
        playerService.playerAbandon.mockImplementation(() => {
            throw new Error('Mock error');
        });
        playerGateway.playerAbandon(socketMock, { pin });
        expect(socketMock.emit).toHaveBeenCalledWith('error', 'Mock error');
    });

    describe('playerMute', () => {
        it('should handle player abandoning the game and emit the "playerAbandon" event with the correct payload', () => {
            const pin = 'mockPin';
            const username = 'mockUsername';
            const clientPlayer = {
                socket: { leave: jest.fn() } as any,
                player: playerstub(),
            };
            playerService.playerMute.mockReturnValue(clientPlayer);
            serverMock.to.mockReturnValue(broadcastMock);
            const payload: GameEventPayload<Player> = { pin, data: clientPlayer.player };
            playerGateway.playerMute(socketMock, { pin, username });
            expect(serverMock.to).toHaveBeenCalledWith(pin);
            expect(broadcastMock.emit).toHaveBeenCalledWith('playerMute', payload);
        });

        it('should emit "error" event if an error occurs during handling player abandoning the game', () => {
            const pin = 'mockPin';
            const username = 'mockUsername';
            playerService.playerMute.mockImplementation(() => {
                throw new Error('Mock error');
            });
            playerGateway.playerMute(socketMock, { pin, username });
            expect(socketMock.emit).toHaveBeenCalledWith('error', 'Mock error');
        });
    });

    describe('handleDisconnect', () => {
        it('should cancel games and abandon players for the disconnected client', () => {
            playerService.disconnect.mockReturnValue(['abandonnedPin']);
            const playerAbandonSpy = jest.spyOn(PlayerGateway.prototype, 'playerAbandon');
            playerGateway.handleDisconnect(socketMock);
            expect(playerAbandonSpy).toHaveBeenCalledWith(socketMock, { pin: 'abandonnedPin' });
        });

        it('should throw an error if there is an issue', () => {
            playerService.disconnect.mockImplementation(() => {
                throw new Error('Mock error');
            });
            playerGateway.handleDisconnect(socketMock);
            expect(socketMock.emit).toHaveBeenCalledWith('error', 'Mock error');
        });
    });
});
