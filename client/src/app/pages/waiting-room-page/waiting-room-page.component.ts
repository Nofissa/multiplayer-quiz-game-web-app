import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TimerService } from '@app/services/timer/timer.service';

@Component({
    selector: 'app-waiting-room-page',
    templateUrl: './waiting-room-page.component.html',
    styleUrls: ['./waiting-room-page.component.scss'],
})
export class WaitingRoomPageComponent implements OnInit {
    pin: string;
    constructor(
        private readonly timerService: TimerService,
        private readonly activatedRoute: ActivatedRoute,
    ) {}

    ngOnInit() {
        this.pin = this.activatedRoute.snapshot.queryParams['pin'];

        this.timerService.startTimer(this.pin);
    }
}
