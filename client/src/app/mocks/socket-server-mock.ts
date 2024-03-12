import { Socket } from 'socket.io-client';

export class SocketServerMock {
    private connectedSockets: Socket[];

    constructor(connectedSockets: Socket[]) {
        this.connectedSockets = connectedSockets;
    }

    emit(eventName: string, data: unknown): void {
        this.connectedSockets.forEach((socket) => {
            socket.listeners(eventName).forEach((listener) => {
                listener(data);
            });
        });
    }
}
