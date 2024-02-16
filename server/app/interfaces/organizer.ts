import { Socket } from 'socket.io';

export interface Organizer {
    socket: Socket;
    username: string;
}
