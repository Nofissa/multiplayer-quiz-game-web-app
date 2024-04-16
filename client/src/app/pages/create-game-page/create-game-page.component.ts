// for mongodb _id fields
/* eslint-disable no-underscore-dangle */
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { QuizDetailsDialogComponent } from '@app/components/dialogs/quiz-details-dialog/quiz-details-dialog.component';
import { MIN_QCM_COUNT_TO_ENABLE_RANDOM_MODE, NOTICE_DURATION_MS } from '@app/constants/constants';
import { Quiz } from '@common/quiz';
import { MaterialServicesProvider } from '@app/providers/material-services.provider';
import { GameService } from '@app/services/game/game-service/game.service';
import { PlayerService } from '@app/services/player/player.service';
import { QuestionHttpService } from '@app/services/question-http/question-http.service';
import { QuizHttpService } from '@app/services/quiz-http/quiz-http.service';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { Player } from '@common/player';
import { PlayerState } from '@common/player-state';
import { Subscription } from 'rxjs';
import SwiperCore, { EffectCoverflow, Navigation, Pagination } from 'swiper';
import { QuestionType } from '@common/question-type';

SwiperCore.use([Navigation, Pagination, EffectCoverflow]);

@Component({
    selector: 'app-create-game-page',
    templateUrl: './create-game-page.component.html',
    styleUrls: ['./create-game-page.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class CreateGamePageComponent implements OnInit, OnDestroy {
    enableRandomMode: boolean = false;
    quizzArray: Quiz[];

    createGameSubscription: Subscription = new Subscription();

    private readonly dialogService: MatDialog;
    private readonly snackBarService: MatSnackBar;

    // this component needs multiple services to work correctly
    // eslint-disable-next-line max-params
    constructor(
        materialServicesProvider: MaterialServicesProvider,
        private readonly router: Router,
        private readonly questionHttpService: QuestionHttpService,
        private readonly quizHttpService: QuizHttpService,
        private readonly gameService: GameService,
        private readonly playerService: PlayerService,
        private readonly webSockerService: WebSocketService,
    ) {
        this.dialogService = materialServicesProvider.dialog;
        this.snackBarService = materialServicesProvider.snackBar;
    }

    ngOnInit() {
        this.questionHttpService.getAllQuestions().subscribe((questions) => {
            if (questions.filter((x) => x.type === QuestionType.QCM).length >= MIN_QCM_COUNT_TO_ENABLE_RANDOM_MODE) {
                this.enableRandomMode = true;
            }
        });
        this.loadQuizzes();
    }

    ngOnDestroy() {
        if (!this.createGameSubscription.closed) {
            this.createGameSubscription.unsubscribe();
        }
    }

    loadQuizzes(): void {
        this.quizHttpService.getVisibleQuizzes().subscribe({
            next: (quizzes) => {
                this.quizzArray = quizzes;
            },
        });
    }

    openRandomGameDetails(): void {
        const dialogRef = this.dialogService.open(QuizDetailsDialogComponent, {
            data: {
                quiz: null,
                onCreateGame: () => {
                    dialogRef.close();
                    this.createGame();
                },
            },
        });
    }

    openQuizDetails(quiz: Quiz): void {
        const dialogRef = this.dialogService.open(QuizDetailsDialogComponent, {
            data: {
                quiz,
                onCreateGame: (receivedQuiz: Quiz) => {
                    dialogRef.close();
                    this.createGame(receivedQuiz);
                },
                onTestGame: (receivedQuiz: Quiz) => {
                    dialogRef.close();
                    this.testGame(receivedQuiz);
                },
                onNotFound: () => {
                    dialogRef.close();
                    this.snackBarService.open("Le quiz n'est plus disponible, veuillez en sélectionner un autre", 'OK', {
                        duration: NOTICE_DURATION_MS,
                        verticalPosition: 'top',
                        panelClass: ['base-snackbar'],
                    });
                    this.loadQuizzes();
                },
            },
        });
    }

    private createGame(quiz?: Quiz) {
        this.createGameSubscription = this.gameService.onCreateGame((pin: string) => {
            this.router.navigate(['/host-game'], { queryParams: { pin, isRandom: !quiz?.id } });
            const player: Player = {
                socketId: this.webSockerService.getSocketId(),
                username: 'Organisateur',
                score: 0,
                speedAwardCount: 0,
                state: PlayerState.Playing,
                isTyping: false,
                hasInteracted: false,
                hasSubmitted: false,
                isMuted: false,
            };
            this.playerService.setPlayer(pin, player);
        });

        this.gameService.createGame(quiz?._id ?? undefined);
    }

    private testGame(quiz: Quiz) {
        this.createGameSubscription = this.gameService.onCreateGame((pin: string) => {
            const player: Player = {
                socketId: this.webSockerService.getSocketId(),
                username: 'Testeur',
                score: 0,
                speedAwardCount: 0,
                state: PlayerState.Playing,
                isTyping: false,
                hasInteracted: false,
                hasSubmitted: false,
                isMuted: false,
            };
            this.playerService.setPlayer(pin, player);
            this.gameService.joinGame(pin, 'Testeur');
            this.router.navigate(['/game'], { queryParams: { pin, isTest: true } });
        });
        this.gameService.createGame(quiz._id);
    }
}
