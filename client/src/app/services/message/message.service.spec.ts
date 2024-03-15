import { TestBed } from '@angular/core/testing';
import { SocketServerMock } from '@app/mocks/socket-server-mock';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { Chatlog } from '@common/chatlog';
import { GameEventPayload } from '@common/game-event-payload';
import { Observable } from 'rxjs';
import { io } from 'socket.io-client';
import { MessageService } from './message.service';

describe('MessageService', () => {
    let messageService: MessageService;
    let webSocketServiceSpy: jasmine.SpyObj<WebSocketService>;
    let socketServerMock: SocketServerMock;
    const stubData = {
        pin1: '1234',
        pin2: '4321',
        callback: jasmine.createSpy('callback'),
        sendMessageEventName: 'sendMessage',
    };

    beforeEach(() => {
        webSocketServiceSpy = jasmine.createSpyObj('WebSocketService', ['emit', 'on'], {
            socketInstance: io(),
        });

        TestBed.configureTestingModule({
            providers: [MessageService, { provide: WebSocketService, useValue: webSocketServiceSpy }],
        });

        messageService = TestBed.inject(MessageService);
        webSocketServiceSpy = TestBed.inject(WebSocketService) as jasmine.SpyObj<WebSocketService>;
        webSocketServiceSpy.on.and.callFake(<T>(eventName: string, func: (data: T) => void) => {
            return new Observable<T>((observer) => {
                webSocketServiceSpy['socketInstance'].on(eventName, (data) => {
                    observer.next(data);
                });

                return () => {
                    webSocketServiceSpy['socketInstance'].off(eventName);
                };
            }).subscribe(func);
        });
        socketServerMock = new SocketServerMock([webSocketServiceSpy['socketInstance']]);
        stubData.callback.calls.reset();
    });

    it('should be created', () => {
        expect(messageService).toBeTruthy();
    });

    it('should raise sendMessage event', () => {
        const message = 'hello';
        messageService.sendMessage(stubData.pin1, message);
        expect(webSocketServiceSpy.emit).toHaveBeenCalledWith(stubData.sendMessageEventName, { pin: stubData.pin1, message });
    });

    it('should subscribe to sendMessage event and call the callback on server emit if pin matches', () => {
        messageService.onSendMessage(stubData.pin1, stubData.callback);

        const chatlogs: Chatlog[] = [];
        const payload: GameEventPayload<Chatlog[]> = { pin: stubData.pin1, data: chatlogs };

        socketServerMock.emit(stubData.sendMessageEventName, payload);

        expect(webSocketServiceSpy.on).toHaveBeenCalledWith(stubData.sendMessageEventName, jasmine.any(Function));
        expect(stubData.callback).toHaveBeenCalledWith(chatlogs);
    });

    it('should subscribe to sendMessage event and not call the callback on server emit if pin does not match', () => {
        messageService.onSendMessage(stubData.pin1, stubData.callback);

        const chatlogs: Chatlog[] = [];
        const payload: GameEventPayload<Chatlog[]> = { pin: stubData.pin2, data: chatlogs };

        socketServerMock.emit(stubData.sendMessageEventName, payload);

        expect(webSocketServiceSpy.on).toHaveBeenCalledWith(stubData.sendMessageEventName, jasmine.any(Function));
        expect(stubData.callback).not.toHaveBeenCalled();
    });

    it('should return empty array if no chat logs are available', () => {
        const pin = 'testPIN';
        const chatlogs = messageService.getGameChatlogs(pin);
        expect(chatlogs).toEqual([]);
    });

    it('should return chat logs if there are some', () => {
        const pin = 'testPIN';
        const expectedChatlogs = [
            { author: '1', message: 'hello', date: new Date() },
            { author: '2', message: 'hi', date: new Date() },
        ];
        messageService['gameChatlogsMap'].set(pin, expectedChatlogs);

        const chatlogs = messageService.getGameChatlogs(pin);
        expect(chatlogs).toEqual(expectedChatlogs);
    });
});
