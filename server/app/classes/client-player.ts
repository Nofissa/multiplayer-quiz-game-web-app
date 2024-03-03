import { Player } from '@common/player';
import { PlayerState } from '@common/player-state';
import { Socket } from 'socket.io';

export class ClientPlayer {
    socket: Socket;
    player: Player;

    constructor(socket: Socket, username: string) {
        this.socket = socket;
        this.player = { username, state: PlayerState.Playing, score: 0, speedAwardCount: 0 };
    }
}
