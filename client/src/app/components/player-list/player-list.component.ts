import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { PlayerListDisplayOptions } from '@app/interfaces/player-list-display-options';
import { GameServicesProvider } from '@app/providers/game-services.provider';
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
    displayOptions: PlayerListDisplayOptions = {};
    players: Player[] = [];

    playerStates = PlayerState;

    private eventSubscriptions: Subscription[] = [];

    private readonly gameHttpService: GameHttpService;
    private readonly gameService: GameService;
    private readonly playerService: PlayerService;

    constructor(gameServicesProvider: GameServicesProvider) {
        this.gameHttpService = gameServicesProvider.gameHttpService;
        this.gameService = gameServicesProvider.gameService;
        this.playerService = gameServicesProvider.playerService;
    }

    ngOnInit() {
        this.gameHttpService.getGameSnapshotByPin(this.pin).subscribe((snapshot) => {
            this.players = snapshot.players;
            this.trySort();
        });

        this.setupSubscription(this.pin);
    }

    ngOnDestroy() {
        this.eventSubscriptions.forEach((sub) => {
            if (sub && !sub.closed) {
                sub.unsubscribe();
            }
        });
    }

    banPlayer(player: Player) {
        this.playerService.playerBan(this.pin, player.username);
    }

    private upsertPlayer(player: Player) {
        const index = this.players.findIndex((x) => x.socketId === player.socketId);

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

    private setupSubscription(pin: string) {
        this.eventSubscriptions.push(
            this.gameService.onQcmSubmit(pin, (evaluation) => {
                this.upsertPlayer(evaluation.player);
            }),

            this.gameService.onJoinGame(pin, (player) => {
                this.upsertPlayer(player);
            }),

            this.playerService.onPlayerBan(pin, (player) => {
                this.upsertPlayer(player);
            }),

            this.playerService.onPlayerAbandon(pin, (player) => {
                this.upsertPlayer(player);
            }),

            this.gameService.onStartGame(pin, () => {
                this.displayOptions.ban = false;
            }),
        );
    }
}
