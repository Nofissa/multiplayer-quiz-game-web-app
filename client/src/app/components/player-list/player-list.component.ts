import { Component, Input, OnInit } from '@angular/core';
import { GameService } from '@app/services/game/game-service/game.service';
import { Player } from '@common/player';
import { PlayerState } from '@common/player-state';
import { Subscription } from 'rxjs';

const NOT_FOUND_INDEX = -1;

@Component({
    selector: 'app-player-list',
    templateUrl: './player-list.component.html',
    styleUrls: ['./player-list.component.scss'],
})
export class PlayerListComponent implements OnInit {
    @Input()
    isHost: boolean;
    @Input()
    pin: string;
    @Input()
    isStatic: boolean;
    @Input()
    staticPlayers: Player[];

    playerStates = PlayerState;
    players: Player[] = [];
    playerJoinSub: Subscription;
    playerBanSub: Subscription;
    playerAbandonSub: Subscription;

    constructor(private readonly gameService: GameService) {}

    ngOnInit() {
        if (!this.isStatic) {
            this.playerJoinSub = this.gameService.onJoinGame(this.pin, (payload) => {
                this.players = payload.players;
            });
            this.playerBanSub = this.gameService.onPlayerBan(this.pin, (player) => {
                const index = this.players.findIndex((p) => p.username === player.username);
                if (index !== NOT_FOUND_INDEX) {
                    this.players[index] = player;
                }
            });
            this.playerAbandonSub = this.gameService.onPlayerAbandon(this.pin, (player) => {
                const index = this.players.findIndex((p) => p.username === player.username);
                if (index !== NOT_FOUND_INDEX) {
                    this.players[index] = player;
                }
            });
        } else {
            this.staticPlayers.sort((a, b) => b.score - a.score);
            this.players = this.staticPlayers;
        }
    }

    banPlayer(player: Player) {
        this.gameService.playerBan(this.pin, player.username);
    }
}
