import { Component, Input, OnInit } from '@angular/core';
import { GameService } from '@app/services/game/game.service';
import { Player } from '@common/player';
import { PlayerState } from '@common/player-state';
import { Subscription } from 'rxjs';

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

    playerStates = PlayerState;
    players: Player[] = [];
    playerJoinSub: Subscription;
    playerBanSub: Subscription;
    playerAbdSub: Subscription;
    private readonly gameService: GameService;

    constructor(gameService: GameService) {
        this.gameService = gameService;
    }

    ngOnInit() {
        this.playerJoinSub = this.gameService.onJoinGame((payload) => {
            this.players = payload.players;
        });
        this.playerAbdSub = this.gameService.onPlayerAbandon((player) => {
            const index = this.players.findIndex((p) => p.username === player.username);
            this.players[index] = player;
        });
        this.playerBanSub = this.gameService.onPlayerBan((player) => {
            const index = this.players.findIndex((p) => p.username === player.username);
            this.players[index] = player;
        });
    }

    banPlayer(player: Player) {
        this.gameService.playerBan(this.pin, player.username);
    }
}
