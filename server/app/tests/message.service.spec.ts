/* eslint-disable @typescript-eslint/no-explicit-any */ // needed for mocking the socket
import { GameService } from '@app/services/game/game.service';
import { MessageService } from '@app/services/message/message.service';
import { Chatlog } from '@common/chatlog';
import { Socket } from 'socket.io';
import { gameStub } from './stubs/game.stub';

describe('messageService', () => {
    let messageService: MessageService;
    let gameServiceMock: jest.Mocked<GameService>;
    let socketMock: jest.Mocked<Socket>;

    beforeEach(() => {
        gameServiceMock = { getGame: jest.fn() } as any as jest.Mocked<GameService>;

        messageService = new MessageService(gameServiceMock);
    });

    it('should be defined', () => {
        expect(messageService).toBeDefined();
    });

    describe('sendMessage', () => {
        it('should return the right chatlog if the client is the Organizer', () => {
            const game = gameStub();
            gameServiceMock.getGame.mockReturnValue(game);
            jest.spyOn(Map.prototype, 'get').mockReturnValue(game.clientPlayers.get('playerId'));
            const messageTest = 'Bonjour';
            const chatlogOrganizer: Chatlog = {
                author: 'Organisateur',
                message: messageTest,
                date: new Date(),
            };

            socketMock = { id: 'organizerId' } as jest.Mocked<Socket>;
            const result = messageService.sendMessage(socketMock, game.pin, messageTest);
            expect(result.author).toEqual(chatlogOrganizer.author);
            expect(result.message).toEqual(messageTest);
        });

        it('should return the right chatlog if the client is the player', () => {
            const game = gameStub();
            gameServiceMock.getGame.mockReturnValue(game);
            jest.spyOn(Map.prototype, 'get').mockReturnValue(game.clientPlayers.get('playerId'));
            const messageTest = 'Bonjour';
            socketMock = { id: 'playerId' } as jest.Mocked<Socket>;
            const result = messageService.sendMessage(socketMock, game.pin, messageTest);
            expect(result.author).toEqual(game.clientPlayers.get('playerId').player.username);
            expect(result.message).toEqual(messageTest);
        });

        it('should it throw an error is the player is muted', () => {
            const game = gameStub();
            game.clientPlayers.get('playerId').player.isMuted = true;
            gameServiceMock.getGame.mockReturnValue(game);
            jest.spyOn(Map.prototype, 'get').mockReturnValue(game.clientPlayers.get('playerId'));
            const messageTest = 'Bonjour';
            expect(() => messageService.sendMessage(socketMock, game.pin, messageTest)).toThrow(
                'Vous ne pouvez pas écrire dans la zone de clavardage',
            );
        });
    });
});
