import { TestBed } from '@angular/core/testing';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SocketServerMock } from '@app/mocks/socket-server-mock';
import { Socket } from 'socket.io-client';
import { WebSocketService } from './web-socket.service';

describe('WebSocketService', () => {
    let webSocketService: WebSocketService;
    let socketServerMock: SocketServerMock;
    let socketSpy: jasmine.SpyObj<Socket>;
    let snackBarServiceSpy: jasmine.SpyObj<MatSnackBar>;

    beforeEach(() => {
        socketSpy = jasmine.createSpyObj('Socket', ['off', 'emit']);
        snackBarServiceSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

        TestBed.configureTestingModule({
            imports: [MatSnackBarModule],
            providers: [WebSocketService, { provide: Socket, useValue: socketSpy }, { provide: MatSnackBar, useValue: snackBarServiceSpy }],
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

        webSocketService.emit(eventName, testData);

        expect(socketSpy.emit).toHaveBeenCalledWith(eventName, testData);
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
        socketSpy.off.and.stub();
        const subscription = webSocketService.on(eventName, callback);

        subscription.unsubscribe();

        expect(socketSpy.off).toHaveBeenCalledWith();
    });

    it('should return the socket ID on getSocketId', () => {
        const socketId = 'some socket id';
        webSocketService['socketInstance'].id = socketId;
        const returnedSocketId = webSocketService.getSocketId();

        expect(returnedSocketId).toEqual(socketId);
    });

    it('should open snack bar on server error', () => {
        socketServerMock.emit('error', 'Some error text');

        expect(snackBarServiceSpy.open).toHaveBeenCalled();
    });
});
