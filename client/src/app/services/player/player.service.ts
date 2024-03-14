import { Injectable } from '@angular/core';
import { Player } from '@common/player';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';

@Injectable({
    providedIn: 'root',
})
export class PlayerService {
    private playersMap: Map<string, Player[]> = new Map();

    constructor(private readonly webSocketService: WebSocketService) {}

    addPlayerInGame(pin: string, player: Player) {
        const players = this.getPlayersInGame(pin);
        players.push(player);
        this.playersMap.set(pin, players);
    }

    getCurrentPlayerFromGame(pin: string): Player | null {
        return this.getPlayersInGame(pin).find((x) => x.socketId === this.webSocketService.getSocketId()) || null;
    }

    isInGame(pin: string, player: Player): boolean {
        return this.getPlayersInGame(pin).some((x) => x.socketId === player.socketId);
    }

    private getPlayersInGame(pin: string): Player[] {
        return this.playersMap.get(pin) || [];
    }
}
