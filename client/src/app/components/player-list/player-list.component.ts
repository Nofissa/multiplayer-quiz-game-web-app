import { Component, Input, OnInit } from '@angular/core';
import { GameService } from '@app/services/game/game.service';
import { Player } from '@common/player';
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

    players: Player[] = [];
    playerJoinSub: Subscription;
    playerBanSub: Subscription;
    private readonly gameService: GameService;

    constructor(gameService: GameService) {
        this.gameService = gameService;
    }

    ngOnInit() {
        this.playerJoinSub = this.gameService.onJoinGame((payload) => {
            this.players = payload.players;
        });
        this.playerBanSub = this.gameService.onPlayerBan((player) => {
            this.players = this.players.filter((p) => p.username !== player.username);
        });
    }

    banPlayer(player: Player) {
        this.gameService.playerBan(this.pin, player.username);
    }
}
