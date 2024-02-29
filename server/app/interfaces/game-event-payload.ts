import { Socket } from 'socket.io';

export interface GameEventPayload<T> {
    pin: string;
    organizer: Socket;
    client: Socket;
    data: T;
}
