import { GameEventPayload } from '@app/interfaces/game-event-payload';
import { Server } from 'socket.io';

export class GameEventDispatcher {
    private server: Server;

    constructor(server: Server) {
        this.server = server;
    }

    sendToClient<T>(eventName: string, payload: GameEventPayload<T>) {
        const { client, data } = payload;

        client.emit(eventName, data);
    }

    sendToOrganizer<T>(eventName: string, payload: GameEventPayload<T>) {
        const { organizer, data } = payload;

        organizer.emit(eventName, data);
    }

    sendToGame<T>(eventName: string, payload: GameEventPayload<T>) {
        const { pin: gamePin, data } = payload;

        this.server.to(gamePin).emit(eventName, data);
    }
}
