import { Injectable } from '@angular/core';
import { Player } from '@common/player';
import { GameHttpService } from '@app/services/game-http/game-http.service';
import { PlayerState } from '@common/player-state';

@Injectable({
    providedIn: 'root',
})
export class PlayerService {
    private players: Map<string, Player> = new Map();

    constructor(private readonly gameHttpService: GameHttpService) {}

    setPlayer(pin: string, player: Player): void {
        this.players.set(pin, player);
    }

    getPlayer(pin: string): Player | null {
        return this.players.get(pin) || null;
    }

    isSelf(pin: string, player: Player): boolean {
        return this.players.get(pin)?.username.toLowerCase() === player.username.toLowerCase();
    }

    syncPlayer(pin: string): void {
        const player = this.getPlayer(pin);

        if (!player) {
            return;
        }

        this.gameHttpService.getGameSnapshotByPin(pin).subscribe((snapshot) => {
            const syncedPlayer = snapshot.players.find((x) => {
                return x.username.toLowerCase() === player.username.toLowerCase() && x.state === PlayerState.Playing;
            });

            if (syncedPlayer) {
                this.setPlayer(pin, syncedPlayer);
            }
        });
    }
}
