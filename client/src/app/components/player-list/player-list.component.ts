import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NOT_FOUND_INDEX } from '@app/constants/constants';
import { PlayerListSortingOptions } from '@app/enums/player-list-sorting-options';
import { PlayerListDisplayOptions } from '@app/interfaces/player-list-display-options';
import { GameServicesProvider } from '@app/providers/game-services.provider';
import { GameHttpService } from '@app/services/game-http/game-http.service';
import { GameService } from '@app/services/game/game-service/game.service';
import { PlayerService } from '@app/services/player/player.service';
import { SubscriptionService } from '@app/services/subscription/subscription.service';
import { TimerService } from '@app/services/timer/timer.service';
import { Player } from '@common/player';
import { PlayerState } from '@common/player-state';
import { TimerEventType } from '@common/timer-event-type';
import { v4 as uuidv4 } from 'uuid';

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
    sortingOptions = PlayerListSortingOptions.NameAscending;
    isTimerFinished: boolean = false;

    playerStates = PlayerState;
    playerListSortingOptions = PlayerListSortingOptions;

    private readonly uuid = uuidv4();
    private readonly gameHttpService: GameHttpService;
    private readonly gameService: GameService;
    private readonly playerService: PlayerService;
    private readonly timerService: TimerService;

    constructor(
        gameServicesProvider: GameServicesProvider,
        private readonly subscriptionService: SubscriptionService,
    ) {
        this.gameHttpService = gameServicesProvider.gameHttpService;
        this.gameService = gameServicesProvider.gameService;
        this.playerService = gameServicesProvider.playerService;
        this.timerService = gameServicesProvider.timerService;
    }

    ngOnInit() {
        this.gameHttpService.getGameSnapshotByPin(this.pin).subscribe((snapshot) => {
            this.players = snapshot.players;
            this.trySort();
        });

        this.setupSubscriptions(this.pin);
    }

    ngOnDestroy() {
        this.subscriptionService.clear(this.uuid);
    }

    banPlayer(player: Player) {
        this.playerService.playerBan(this.pin, player.username);
    }

    mutePlayer(player: Player) {
        this.playerService.playerMute(this.pin, player.username);
    }

    sortPlayers(option: PlayerListSortingOptions) {
        this.sortingOptions = option;
        this.trySort();
    }

    private upsertPlayer(player: Player) {
        const index = this.players.findIndex((x) => x.socketId === player.socketId);

        if (index !== NOT_FOUND_INDEX) {
            this.players[index] = { ...player, hasInteracted: this.players[index].hasInteracted, hasSubmitted: this.players[index].hasSubmitted };
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
        } else {
            switch (this.sortingOptions) {
                case PlayerListSortingOptions.NameAscending:
                    this.players.sort((a, b) => a.username.localeCompare(b.username));
                    break;
                case PlayerListSortingOptions.NameDescending:
                    this.players.sort((a, b) => b.username.localeCompare(a.username));
                    break;
                case PlayerListSortingOptions.ScoreAscending:
                    this.players.sort((a, b) => b.score - a.score);
                    break;
                case PlayerListSortingOptions.ScoreDescending:
                    this.players.sort((a, b) => a.score - b.score);
                    break;
                case PlayerListSortingOptions.StatusAscending:
                    this.players.sort((a, b) => a.username.localeCompare(b.username));
                    this.players.sort((a, b) => a.state - b.state);
                    break;
                case PlayerListSortingOptions.StatusDescending:
                    this.players.sort((a, b) => a.username.localeCompare(b.username));
                    this.players.sort((a, b) => b.state - a.state);
                    break;
                default:
                    throw new Error('Invalid sorting option');
            }
        }
    }

    private setupSubscriptions(pin: string) {
        this.setupGameSubscriptions(pin);
        this.setupTimerSubscriptions(pin);
        this.setupPlayerSubscriptions(pin);
    }

    private setupGameSubscriptions(pin: string) {
        this.subscriptionService.add(
            this.uuid,
            this.gameService.onQcmSubmit(pin, (evaluation) => {
                this.upsertPlayer(evaluation.player);
                if (!this.isTimerFinished) {
                    this.players.forEach((player) => {
                        if (player.socketId === evaluation.player.socketId) {
                            player.hasSubmitted = true;
                        }
                    });
                }
            }),
            this.gameService.onQrlEvaluate(pin, (evaluation) => {
                this.upsertPlayer(evaluation.player);
            }),
            this.gameService.onJoinGame(pin, (player) => {
                this.upsertPlayer(player);
            }),
            this.gameService.onStartGame(pin, () => {
                this.displayOptions.ban = false;
                this.displayOptions.waiting = false;
                this.players.forEach((player) => {
                    player.hasInteracted = false;
                    player.hasSubmitted = false;
                });
                this.isTimerFinished = false;
            }),
            this.gameService.onNextQuestion(pin, () => {
                this.players.forEach((player) => {
                    player.hasInteracted = false;
                    player.hasSubmitted = false;
                    this.isTimerFinished = false;
                });
            }),
            this.gameService.onQcmToggleChoice(pin, (barchartSubmission) => {
                this.players.forEach((player) => {
                    if (player.socketId === barchartSubmission.clientId) {
                        player.hasInteracted = true;
                    }
                });
            }),
            this.gameService.onQrlInputChange(pin, (barchartSubmission) => {
                this.players.forEach((player) => {
                    if (player.socketId === barchartSubmission.clientId) {
                        if (barchartSubmission.isSelected) {
                            player.hasInteracted = true;
                        }
                    }
                });
            }),
            this.gameService.onQrlSubmit(pin, (qrlSubmission) => {
                if (!this.isTimerFinished) {
                    this.players.forEach((player) => {
                        if (player.socketId === qrlSubmission.clientId) {
                            player.hasSubmitted = true;
                        }
                    });
                }
            }),
        );
    }

    private setupTimerSubscriptions(pin: string) {
        this.subscriptionService.add(
            this.uuid,
            this.timerService.onTimerTick(pin, (payload) => {
                if (!payload.remainingTime && payload.eventType === TimerEventType.Question) {
                    this.isTimerFinished = true;
                }
            }),
        );
    }

    private setupPlayerSubscriptions(pin: string) {
        this.subscriptionService.add(
            this.uuid,
            this.playerService.onPlayerBan(pin, (player) => {
                if (player) {
                    this.upsertPlayer(player);
                }
            }),
            this.playerService.onPlayerAbandon(pin, (player) => {
                if (player) {
                    this.upsertPlayer(player);
                }
            }),
            this.playerService.onPlayerMute(pin, (player) => {
                this.upsertPlayer(player);
            }),
        );
    }
}
