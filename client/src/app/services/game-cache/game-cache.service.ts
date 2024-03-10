import { Injectable } from '@angular/core';
import { Player } from '@common/player';
import { PlayerState } from '@common/player-state';
import { Chatlog } from '@common/chatlog';
import { Subscription } from 'rxjs';
import { GameService } from '@app/services/game/game-service/game.service';
import { MessageService } from '@app/services/message/message.service';
import { GameSnapshot } from '@app/interfaces/game-snapshot';
import { Submission } from '@common/submission';
import { Question } from '@app/interfaces/question';

const NOT_FOUND_INDEX = -1;

@Injectable({ providedIn: 'root' })
export class GameCacheService {
    createGameSubscription: Subscription;
    private gameSnapshots: Map<string, GameSnapshot> = new Map();
    private subscriptionsMap: Map<string, Subscription[]> = new Map();

    constructor(
        private readonly gameService: GameService,
        private readonly messageService: MessageService,
    ) {
        this.createGameSubscription = this.gameService.onCreateGame(this.setupSubscriptions.bind(this));
    }

    getPlayers(pin: string): Player[] {
        return this.gameSnapshots.get(pin)?.players || [];
    }

    getSelfPlayer(pin: string): Player | null {
        return this.gameSnapshots.get(pin)?.selfPlayer || null;
    }

    getChatlogs(pin: string): Chatlog[] {
        return this.gameSnapshots.get(pin)?.chatlogs || [];
    }

    getCurrentQuestion(pin: string): Question | null {
        const snapshot = this.gameSnapshots.get(pin);
        return snapshot?.questions[snapshot.currentQuestionIndex] || null;
    }

    getCurrentQuestionSubmissions(pin: string): Submission[] {
        const snapshot = this.gameSnapshots.get(pin);
        return snapshot?.questionSubmissions[snapshot.currentQuestionIndex] || [];
    }

    getGameSubmissions(pin: string): Submission[][] {
        return this.gameSnapshots.get(pin)?.questionSubmissions || [[]];
    }

    private setupSubscriptions(pin: string) {
        const snapshot: GameSnapshot = {
            players: [],
            chatlogs: [],
            selfPlayer: null,
            currentQuestionIndex: 0,
            questions: [],
            questionSubmissions: [[]],
        };
        const subscriptions: Subscription[] = [];

        subscriptions.push(
            this.gameService.onJoinGame(pin, (payload) => {
                snapshot.players.push(payload.player);
                if (payload.isSelf && !snapshot.selfPlayer) {
                    snapshot.selfPlayer = payload.player;
                }
            }),
        );

        subscriptions.push(
            this.gameService.onPlayerAbandon(pin, (quitter) => {
                const index = this.getPlayers(pin).findIndex((x) => x.state === PlayerState.Playing && x.username === quitter.username);

                if (index !== NOT_FOUND_INDEX) {
                    this.getPlayers(pin)[index] = quitter;
                }
            }),
        );

        subscriptions.push(
            this.gameService.onPlayerBan(pin, (bannedPlayer) => {
                const index = this.getPlayers(pin).findIndex((x) => x.state === PlayerState.Playing && x.username === bannedPlayer.username);

                if (index !== NOT_FOUND_INDEX) {
                    this.getPlayers(pin)[index] = bannedPlayer;
                }
            }),
        );

        subscriptions.push(
            this.gameService.onSubmitChoices(pin, (evaluation) => {
                const player = this.getSelfPlayer(pin);

                if (!player) {
                    return;
                }

                player.score += evaluation.score;
                player.speedAwardCount += evaluation.isFirstGoodEvaluation ? 1 : 0;
            }),
        );

        subscriptions.push(
            this.messageService.onSendMessage(pin, (chatlog) => {
                snapshot.chatlogs.push(chatlog);
            }),
        );

        subscriptions.push(
            this.gameService.onToggleSelectChoice(pin, (submissions) => {
                snapshot.questionSubmissions.splice(snapshot.currentQuestionIndex, 1, submissions);
            }),
        );

        subscriptions.push(
            this.gameService.onGetCurrentQuestion(pin, (question) => {
                snapshot.questions.splice(snapshot.currentQuestionIndex, 1, question);
            }),
        );

        subscriptions.push(
            this.gameService.onNextQuestion(pin, (question) => {
                snapshot.questions.splice(snapshot.currentQuestionIndex, 1, question);
                snapshot.currentQuestionIndex++;
            }),
        );

        subscriptions.push(
            this.gameService.onCancelGame(pin, () => {
                this.gameSnapshots.delete(pin);
                this.subscriptionsMap.delete(pin);
            }),
        );

        this.gameSnapshots.set(pin, snapshot);
        this.subscriptionsMap.set(pin, subscriptions);
    }
}
