import { WebSocketService } from './web-socket.service';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SocketServerMock } from '@app/mocks/socket-server-mock';

describe('WebSocketService', () => {
    let webSocketService: WebSocketService;
    let socketServerMock: SocketServerMock;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MatSnackBarModule],
            providers: [WebSocketService],
        });
        webSocketService = TestBed.inject(WebSocketService);
        socketServerMock = new SocketServerMock([webSocketService['socketInstance']]);
    });

    it('should be created', () => {
        expect(webSocketService).toBeTruthy();
    });

    it('should emit data to the socket', () => {
        const eventName = 'testEvent';
        const testData = { message: 'Hello' };

        spyOn(webSocketService['socketInstance'], 'emit');

        webSocketService.emit(eventName, testData);

        expect(webSocketService['socketInstance'].emit).toHaveBeenCalledWith(eventName, testData);
    });

    it('should subscribe to an event and call the callback', () => {
        const eventName = 'testEvent';
        const testData = { message: 'test' };
        const callback = jasmine.createSpy('callback');

        webSocketService.on(eventName, callback);
        socketServerMock.emit(eventName, testData);

        expect(callback).toHaveBeenCalledWith(testData);
    });
});
