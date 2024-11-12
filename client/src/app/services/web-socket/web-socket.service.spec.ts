import { TestBed } from '@angular/core/testing';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SocketServerMock } from '@app/mocks/socket-server-mock';
import { WebSocketService } from './web-socket.service';

describe('WebSocketService', () => {
    let webSocketService: WebSocketService;
    let socketServerMock: SocketServerMock;
    let snackBarServiceSpy: jasmine.SpyObj<MatSnackBar>;

    beforeEach(() => {
        snackBarServiceSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

        TestBed.configureTestingModule({
            imports: [MatSnackBarModule],
            providers: [WebSocketService, { provide: MatSnackBar, useValue: snackBarServiceSpy }],
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
        const emitSpy = spyOn(webSocketService['socketInstance'], 'emit');

        webSocketService.emit(eventName, testData);

        expect(emitSpy).toHaveBeenCalledWith(eventName, testData);
    });

    it('should subscribe to an event and call the callback', () => {
        const eventName = 'testEvent';
        const testData = { message: 'test' };
        const callback = jasmine.createSpy('callback');

        webSocketService.on(eventName, callback);
        socketServerMock.emit(eventName, testData);

        expect(callback).toHaveBeenCalledWith(testData);
    });

    it('should call web socket off on unsubscribe', () => {
        const eventName = 'testEvent';
        const callback = jasmine.createSpy('callback');
        const offSpy = spyOn(webSocketService['socketInstance'], 'off');
        const subscription = webSocketService.on(eventName, callback);

        subscription.unsubscribe();

        expect(offSpy).toHaveBeenCalled();
    });

    it('should return the socket ID on getSocketId', () => {
        const socketId = 'some socket id';
        webSocketService['socketInstance'].id = socketId;
        const returnedSocketId = webSocketService.getSocketId();

        expect(returnedSocketId).toEqual(socketId);
    });
});
