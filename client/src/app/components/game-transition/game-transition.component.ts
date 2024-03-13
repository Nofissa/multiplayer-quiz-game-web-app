import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { GameServicesProvider } from '@app/providers/game-services.provider';
import { GameHttpService } from '@app/services/game-http/game-http.service';
import { TimerService } from '@app/services/timer/timer.service';
import { GameSnapshot } from '@common/game-snapshot';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-game-transition',
    templateUrl: './game-transition.component.html',
    styleUrls: ['./game-transition.component.scss'],
})
export class GameTransitionComponent implements OnInit, OnDestroy {
    @Input()
    pin: string;
    @Input()
    isStarting: boolean;
    @Input()
    isLoadingNextQuestion: boolean;

    snapshot: GameSnapshot;

    private eventSubscriptions: Subscription[] = [];

    private readonly gameHttpService: GameHttpService;
    private readonly timerService: TimerService;

    constructor(gameServicesProvider: GameServicesProvider) {
        this.gameHttpService = gameServicesProvider.gameHttpService;
        this.timerService = gameServicesProvider.timerService;
    }

    ngOnInit() {
        this.setupSubscription(this.pin);
    }

    ngOnDestroy() {
        this.eventSubscriptions.forEach((sub) => {
            if (!sub.closed) {
                sub.unsubscribe();
            }
        });
    }

    private setupSubscription(pin: string) {
        this.eventSubscriptions.push(
            this.timerService.onStartTimer(pin, () => {
                this.gameHttpService.getGameSnapshotByPin(pin).subscribe((snapshot) => {
                    this.snapshot = snapshot;
                });
            }),
        );
    }
}
