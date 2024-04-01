import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { GameServicesProvider } from '@app/providers/game-services.provider';
import { MaterialServicesProvider } from '@app/providers/material-services.provider';
import { GameHttpService } from '@app/services/game-http/game-http.service';
import { GameService } from '@app/services/game/game-service/game.service';
import { Player } from '@common/player';
import { Subscription } from 'rxjs';

const NOT_FOUND_INDEX = -1;

@Component({
    selector: 'app-qrl-list',
    templateUrl: './qrl-list.component.html',
    styleUrls: ['./qrl-list.component.scss'],
})
export class QrlListComponent implements OnInit, OnDestroy {
    @Input()
    pin: string;
    players: Player[] = [];
    playersMap: Map<Player, string | undefined> = new Map();
    evaluationsReceived: number = 0;
    private eventSubscriptions: Subscription[] = [];

    private readonly gameHttpService: GameHttpService;
    private readonly gameService: GameService;

    constructor(materialServicesProvider: MaterialServicesProvider, gameServicesProvider: GameServicesProvider) {
        this.gameHttpService = gameServicesProvider.gameHttpService;
        this.gameService = gameServicesProvider.gameService;
    }

    ngOnInit() {
        this.gameHttpService.getGameSnapshotByPin(this.pin).subscribe((snapshot) => {
            this.players = snapshot.players;
            this.players.sort((a, b) => a.username.localeCompare(b.username));
            this.players.forEach((player) => {
                this.playersMap.set(player, undefined);
            });
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

    // evaluateAnswer(grade: Grade) {
    //     this.gameService.qrlEvaluate(this.pin, grade);
    // }

    private setupSubscription(pin: string) {
        this.eventSubscriptions.push(
            this.gameService.onQrlSubmit(pin, (submission) => {
                const index = this.players.findIndex((x) => x.socketId === submission.clientId);
                if (index !== NOT_FOUND_INDEX) {
                    this.evaluationsReceived += 1;
                    this.playersMap.set(this.players[index], submission.answer);
                }
            }),
        );
    }
}
