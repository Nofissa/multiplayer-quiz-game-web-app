import { PlayerState } from '@app/enums/player-state';
import { Socket } from 'socket.io';

export class Player {
    socket: Socket;
    username: string;
    state: PlayerState;
    score: number = 0;
    speedAwardCount: number = 0;

    constructor(socket: Socket, username: string) {
        this.socket = socket;
        this.username = username;
        this.state = PlayerState.Playing;
    }
}
