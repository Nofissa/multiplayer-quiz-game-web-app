import { GameService } from '@app/services/game/game.service';
import { MessageService } from '@app/services/message/message.service';
import { QuizService } from '@app/services/quiz/quiz.service';
import { Chatlog } from '@common/chatlog';
import { Socket } from 'socket.io';
import { gameStub } from './stubs/game.stub';

describe('messageService', () => {
    let gameServiceTest: GameService;
    let messageServiceTest: MessageService;
    let quizServiceMock: jest.Mocked<QuizService>;
    let socketMock: jest.Mocked<Socket>;
    beforeEach(() => {
        gameServiceTest = new GameService(quizServiceMock);
        messageServiceTest = new MessageService(gameServiceTest);
    });

    it('should be defined', () => {
        expect(messageServiceTest).toBeDefined();
    });

    describe('sendMessage', () => {
        const game = gameStub();
        jest.spyOn(GameService.prototype, 'getGame').mockReturnValue(game);
        jest.spyOn(Map.prototype, 'get').mockReturnValue(game.clientPlayers.get('playerId'));
        const messageTest = 'Bonjour';
        const chatlogOrganizer: Chatlog = {
            author: 'Organisateur',
            message: messageTest,
            date: new Date(),
        };

        it('should return the right chatlog if the client is the Organizer', () => {
            socketMock = { id: 'organizerId' } as jest.Mocked<Socket>;
            const result = messageServiceTest.sendMessage(socketMock, game.pin, messageTest);
            expect(result.author).toEqual(chatlogOrganizer.author);
            expect(result.message).toEqual(messageTest);
        });

        it('should return the right chatlog if the client is the player', () => {
            socketMock = { id: 'playerId' } as jest.Mocked<Socket>;
            const result = messageServiceTest.sendMessage(socketMock, game.pin, messageTest);
            expect(result.author).toEqual(game.clientPlayers.get('playerId').player.username);
            expect(result.message).toEqual(messageTest);
        });
    });
});
