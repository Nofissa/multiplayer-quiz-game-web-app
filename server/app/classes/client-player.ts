import { Player } from '@common/player';
import { PlayerState } from '@common/player-state';
import { Socket } from 'socket.io';

export class ClientPlayer {
    socket: Socket;
    player: Player;

    constructor(socket: Socket, username: string) {
        this.socket = socket;
        this.player.username = username;
        this.player.state = PlayerState.Playing;
        this.player.score = 0;
        this.player.speedAwardCount = 0;
    }
}
