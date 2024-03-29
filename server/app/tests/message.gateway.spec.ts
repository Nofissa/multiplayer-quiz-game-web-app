/* eslint-disable @typescript-eslint/no-explicit-any */
import { MessageGateway } from '@app/gateways/message.gateway';
import { MessageService } from '@app/services/message/message.service';
import { Chatlog } from '@common/chatlog';
import { Server, Socket } from 'socket.io';

describe('MessageGateway', () => {
    let messageGateway: MessageGateway;
    let messageService: jest.Mocked<MessageService>;
    let socketMock: jest.Mocked<Socket>;
    let serverMock: jest.Mocked<Server>;

    beforeEach(() => {
        messageService = {
            sendMessage: jest.fn(),
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
        messageGateway = new MessageGateway(messageService);
        messageGateway.server = serverMock;
    });

    it('should be describe', () => {
        expect(messageGateway).toBeDefined();
    });

    describe('sendMessage', () => {
        const pin = 'mockPin';
        const message = 'Hello, world!';
        const chatlogTest: Chatlog = {
            author: 'Player',
            message,
            date: new Date(),
        };

        it('should send a message to the specified room', () => {
            messageService.sendMessage.mockReturnValue(chatlogTest);
            messageGateway.sendMessage(socketMock, { pin, message });
            expect(serverMock.to).toHaveBeenCalledWith(pin);
        });

        it('should emit "error" event if an error occurs during sending the message', () => {
            messageService.sendMessage.mockReturnValue(chatlogTest);
            serverMock.to.mockImplementation(() => {
                throw new Error('Mock error');
            });
            messageGateway.sendMessage(socketMock, { pin, message });
            expect(socketMock.emit).toHaveBeenCalledWith('error', 'Mock error');
        });
    });
});
