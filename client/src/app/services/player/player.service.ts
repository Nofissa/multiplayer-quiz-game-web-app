import { Injectable } from '@angular/core';
import { Player } from '@common/player';

@Injectable({
    providedIn: 'root',
})
export class PlayerService {
    private players: Map<string, Player> = new Map();

    setPlayer(pin: string, player: Player) {
        this.players.set(pin, player);
    }

    getPlayer(pin: string) {
        return this.players.get(pin);
    }
}
