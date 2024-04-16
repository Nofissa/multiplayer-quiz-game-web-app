import { Injectable } from '@angular/core';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { applyIfPinMatches } from '@app/utils/conditional-applications/conditional-applications';
import { Player } from '@common/player';
import { Subscription } from 'rxjs';

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

    playerAbandon(pin: string) {
        this.webSocketService.emit('playerAbandon', { pin });
    }

    onPlayerAbandon(pin: string, callback: (quitter: Player) => void): Subscription {
        return this.webSocketService.on('playerAbandon', applyIfPinMatches(pin, callback));
    }

    playerBan(pin: string, username: string) {
        this.webSocketService.emit('playerBan', { pin, username });
    }

    onPlayerBan(pin: string, callback: (bannedPlayer: Player | null) => void): Subscription {
        return this.webSocketService.on('playerBan', applyIfPinMatches(pin, callback));
    }

    playerMute(pin: string, username: string) {
        this.webSocketService.emit('playerMute', { pin, username });
    }

    onPlayerMute(pin: string, callback: (payload: Player) => void): Subscription {
        return this.webSocketService.on('playerMute', applyIfPinMatches(pin, callback));
    }
}
