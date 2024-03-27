import { Injectable } from '@angular/core';
import { Player } from '@common/player';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { Subscription } from 'rxjs';
import { applyIfPinMatches } from '@app/utils/conditional-applications/conditional-applications';
import { Submission } from '@common/submission';

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

    onPlayerBan(pin: string, callback: (bannedPlayer: Player) => void): Subscription {
        return this.webSocketService.on('playerBan', applyIfPinMatches(pin, callback));
    }

    playerMute(pin: string, choiceIndex: number) {
        this.webSocketService.emit('playerMute', { pin, choiceIndex });
    }

    onPlayerMute(pin: string, callback: (payload: Submission[]) => void): Subscription {
        return this.webSocketService.on('playerMute', applyIfPinMatches(pin, callback));
    }
}
