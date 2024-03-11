import { Component, Input, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ConfirmationDialogComponent } from '@app/components/dialogs/confirmation-dialog/confirmation-dialog.component';
import { Question } from '@common/question';
import { GameServicesProvider } from '@app/providers/game-services.provider';
import { GameService } from '@app/services/game/game-service/game.service';
import { KeyBindingService } from '@app/services/key-binding/key-binding.service';
import { TimerService } from '@app/services/timer/timer.service';
import { Player } from '@common/player';
import { Subscription } from 'rxjs';
import { GameHttpService } from '@app/services/game-http/game-http.service';
import { PlayerService } from '@app/services/player/player.service';

const NOT_FOUND_INDEX = -1;

@Component({
    selector: 'app-game-board',
    templateUrl: './game-board.component.html',
    styleUrls: ['./game-board.component.scss'],
    providers: [GameServicesProvider],
})
export class GameBoardComponent implements OnInit, OnDestroy {
    @Input()
    pin: string;
    @Input()
    isTest: boolean;

    question: Question;
    player: Player | null;

    hasSubmited: boolean = false;
    selectedChoiceIndexes: number[] = [];

    readonly gameHttpService: GameHttpService;
    readonly gameService: GameService;
    readonly timerService: TimerService;
    readonly keyBindingService: KeyBindingService;

    private toggleSelectChoiceSubscription: Subscription = new Subscription();
    private submitChoicesSubscription: Subscription = new Subscription();
    private timerTickSubscription: Subscription = new Subscription();

    constructor(
        gameServicesProvider: GameServicesProvider,
        private readonly playerService: PlayerService,
        private readonly dialog: MatDialog,
        private readonly router: Router,
    ) {
        this.gameHttpService = gameServicesProvider.gameHttpService;
        this.gameService = gameServicesProvider.gameService;
        this.timerService = gameServicesProvider.timerService;
        this.keyBindingService = gameServicesProvider.keyBindingService;
    }

    @HostListener('window:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): void {
        const focusedElement = document.activeElement as HTMLElement;

        if (focusedElement.tagName.toLowerCase() === 'textarea') {
            return;
        }

        const executor = this.keyBindingService.getExecutor(event.key);

        if (executor) {
            event.preventDefault();
            executor();
        }
    }

    ngOnInit() {
        this.player = this.playerService.getPlayer(this.pin);
        this.gameHttpService.getGameSnapshotByPin(this.pin).subscribe((snapshot) => {
            this.question = snapshot.questions[snapshot.currentQuestionIndex];
        });
        this.submitChoicesSubscription = this.gameService.onSubmitChoices(this.pin, (evaluation) => {
            if (evaluation.isLastEvaluation) {
                this.playerService.syncPlayer(this.pin);
                // result view;
            }
        });
        this.timerTickSubscription = this.timerService.onTimerTick(this.pin, (remainingTime) => {
            if (remainingTime === 0) {
                this.submitChoices();
            }
        });
        this.setupKeyBindings();
    }

    ngOnDestroy() {
        if (!this.toggleSelectChoiceSubscription.closed) {
            this.toggleSelectChoiceSubscription.unsubscribe();
        }
        if (!this.submitChoicesSubscription.closed) {
            this.submitChoicesSubscription.unsubscribe();
        }
        if (!this.timerTickSubscription.closed) {
            this.timerTickSubscription.unsubscribe();
        }
    }

    setupKeyBindings() {
        ['1', '2', '3', '4'].forEach((x) => {
            this.keyBindingService.registerKeyBinding(x, () => {
                const choiceIndex = parseInt(x, 10) - 1;
                this.toggleSelectChoice(choiceIndex);
            });
        });

        this.keyBindingService.registerKeyBinding('Enter', this.submitChoices.bind(this));
    }

    submitChoices() {
        this.hasSubmited = true;
        this.gameService.submitChoices(this.pin);
    }

    toggleSelectChoice(choiceIndex: number) {
        const foundIndex = this.selectedChoiceIndexes.indexOf(choiceIndex);

        if (foundIndex !== NOT_FOUND_INDEX) {
            this.selectedChoiceIndexes.splice(foundIndex, 1);
        } else {
            this.selectedChoiceIndexes.push(choiceIndex);
        }

        this.gameService.toggleSelectChoice(this.pin, choiceIndex);
    }

    openConfirmationDialog() {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '300px',
            data: { prompt: 'Voulez-vous vraiment quitter la partie?' },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.gameService.playerAbandon(this.pin);
                const redirect = this.isTest ? '/create-game' : '/home';
                this.router.navigateByUrl(redirect);
            }
        });
    }
}
