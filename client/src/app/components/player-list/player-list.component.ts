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

    playerStates = PlayerState;
    players: Player[] = [];
    playerJoinSub: Subscription;
    playerBanSub: Subscription;
    playerAbandonSub: Subscription;
    questionFinished: Subscription;

    constructor(private readonly gameService: GameService) {}

    ngOnInit() {
        this.playerJoinSub = this.gameService.onJoinGame((payload) => {
            this.players = payload.players;
        });
        this.playerAbandonSub = this.gameService.onPlayerAbandon((player) => {
            const index = this.players.findIndex((p) => p.username === player.username);
            if (index !== NOT_FOUND_INDEX) {
                this.players[index] = player;
            }
        });
        this.playerBanSub = this.gameService.onPlayerBan((player) => {
            const index = this.players.findIndex((p) => p.username === player.username);
            if (index !== NOT_FOUND_INDEX) {
                this.players[index] = player;
            }
        });
        /*
        //TODO:
        idealement faire un service qui detect quand la questions est fini puis utilise gameservice du server pour getGame()
        this.questionFinished = this.gameService.onQuestionFinished((payload) => {
            this.players = payload.game.players;
            this.players.sort((a, b) => b.score - a.score);
        });
        */
    }

    banPlayer(player: Player) {
        this.gameService.playerBan(this.pin, player.username);
    }
}
