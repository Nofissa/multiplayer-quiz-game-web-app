import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PlayerListDisplayOptions } from '@app/interfaces/player-list-display-options';
import { GameHttpService } from '@app/services/game-http/game-http.service';
import { GameService } from '@app/services/game/game-service/game.service';
import { PlayerService } from '@app/services/player/player.service';
import { Player } from '@common/player';
import { PlayerState } from '@common/player-state';
import { Subscription } from 'rxjs';

const NOT_FOUND_INDEX = -1;

@Component({
    selector: 'app-player-list',
    templateUrl: './player-list.component.html',
    styleUrls: ['./player-list.component.scss'],
})
export class PlayerListComponent implements OnInit, OnDestroy {
    @Input()
    pin: string;
    @Input()
    displayOptions: PlayerListDisplayOptions;
    playerStates = PlayerState;
    players: Player[] = [];

    private playerJoinSub: Subscription = new Subscription();
    private playerBanSub: Subscription = new Subscription();
    private playerAbandonSub: Subscription = new Subscription();

    // Depends on many services
    // eslint-disable-next-line max-params
    constructor(
        private readonly gameHttpService: GameHttpService,
        private readonly gameService: GameService,
        private readonly playerService: PlayerService,
        private readonly router: Router,
    ) {}

    ngOnInit() {
        this.gameHttpService.getGameSnapshotByPin(this.pin).subscribe((snapshot) => {
            this.players = snapshot.players;
            this.trySort();
        });

        this.playerJoinSub = this.gameService.onJoinGame(this.pin, (payload) => {
            this.upsertPlayer(payload.player);
        });
        this.playerBanSub = this.gameService.onPlayerBan(this.pin, (player) => {
            if (this.playerService.isSelf(this.pin, player)) {
                this.router.navigateByUrl('/home');
            }

            this.upsertPlayer(player);
        });
        this.playerAbandonSub = this.gameService.onPlayerAbandon(this.pin, (player) => {
            if (this.playerService.isSelf(this.pin, player)) {
                this.router.navigateByUrl('/home');
            }

            this.upsertPlayer(player);
        });
    }

    ngOnDestroy() {
        if (!this.playerJoinSub.closed) {
            this.playerJoinSub.unsubscribe();
        }
        if (!this.playerBanSub.closed) {
            this.playerBanSub.unsubscribe();
        }
        if (!this.playerAbandonSub.closed) {
            this.playerAbandonSub.unsubscribe();
        }
    }

    banPlayer(player: Player) {
        this.gameService.playerBan(this.pin, player.username);
    }

    private upsertPlayer(player: Player) {
        const index = this.players.findIndex((p) => p.username === player.username && p.state === PlayerState.Playing);

        if (index !== NOT_FOUND_INDEX) {
            this.players[index] = player;
        } else {
            this.players.push(player);
        }

        this.trySort();
    }

    private trySort() {
        if (this.displayOptions.sorted) {
            this.players = this.players.sort((a, b) => {
                if (a.score !== b.score) {
                    return b.score - a.score;
                } else {
                    return a.username.localeCompare(b.username);
                }
            });
        }
    }
}
