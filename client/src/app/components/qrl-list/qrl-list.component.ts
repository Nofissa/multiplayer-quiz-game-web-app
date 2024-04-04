import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { GameServicesProvider } from '@app/providers/game-services.provider';
import { MaterialServicesProvider } from '@app/providers/material-services.provider';
import { GameHttpService } from '@app/services/game-http/game-http.service';
import { GameService } from '@app/services/game/game-service/game.service';
import { Grade } from '@common/grade';
import { Player } from '@common/player';
import { Subscription } from 'rxjs';
import { SwiperComponent } from 'swiper/angular';

const NOT_FOUND_INDEX = -1;

@Component({
    selector: 'app-qrl-list',
    templateUrl: './qrl-list.component.html',
    styleUrls: ['./qrl-list.component.scss'],
})
export class QrlListComponent implements OnInit, OnDestroy {
    @ViewChild('swiperRef') swiperRef: SwiperComponent;
    @Input()
    pin: string;
    players: Player[] = [];
    playersMap: Map<Player, string | undefined> = new Map();
    playersButtons: Map<Player, boolean> = new Map();
    submissionsReceived: number = 0;
    evaluationsDone: number = 0;
    evaluationsSent: boolean = false;
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

    evaluateAnswer(socketId: string, grade: Grade) {
        this.gameService.qrlEvaluate(socketId, this.pin, grade);
        const index = this.players.findIndex((x) => x.socketId === socketId);
        this.playersButtons.set(this.players[index], true);
        if (this.swiperRef) {
            this.swiperRef.swiperRef.slideNext();
        }
        this.evaluationsDone += 1;
        if (this.evaluationsDone === this.players.length) {
            this.evaluationsSent = true;
        }
    }

    private setupSubscription(pin: string) {
        this.eventSubscriptions.push(
            this.gameService.onQrlSubmit(pin, (submission) => {
                const index = this.players.findIndex((x) => x.socketId === submission.clientId);
                if (index !== NOT_FOUND_INDEX) {
                    this.submissionsReceived += 1;
                    this.playersMap.set(this.players[index], submission.answer);
                    this.playersButtons.set(this.players[index], false);
                }
            }),

            this.gameService.onNextQuestion(pin, () => {
                this.evaluationsSent = false;
                this.evaluationsDone = 0;
                this.submissionsReceived = 0;
            }),
        );
    }
}
