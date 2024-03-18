import { Injectable } from '@angular/core';
import { Player } from '@common/player';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';

@Injectable({
    providedIn: 'root',
})
export class PlayerService {
    private playersMap: Map<string, Player> = new Map();

    constructor(private readonly webSocketService: WebSocketService) {}

    setPlayer(pin: string, player: Player) {
        this.playersMap.set(`${pin}-${player.socketId}`, player);
    }

    getCurrentPlayer(pin: string): Player | null {
        return this.playersMap.get(`${pin}-${this.webSocketService.getSocketId()}`) || null;
    }
}
