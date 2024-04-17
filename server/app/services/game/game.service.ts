/* eslint-disable max-lines */ // file simply has a lot of method, we tried splitting functionnalities into multiple servides
import { ClientPlayer } from '@app/classes/client-player';
import { Game } from '@app/classes/game';
import { CONSTANTS } from '@app/constants/constants';
import { generateRandomPin } from '@app/helpers/pin';
import { Question } from '@app/model/database/question';
import { Quiz } from '@app/model/database/quiz';
import { QuestionService } from '@app/services/question/question.service';
import { QuizService } from '@app/services/quiz/quiz.service';
import { TimerService } from '@app/services/timer/timer.service';
import { BarchartSubmission } from '@common/barchart-submission';
import { GameState } from '@common/game-state';
import { Grade } from '@common/grade';
import { Player } from '@common/player';
import { PlayerState } from '@common/player-state';
import { QcmEvaluation } from '@common/qcm-evaluation';
import { QcmSubmission } from '@common/qcm-submission';
import { QrlEvaluation } from '@common/qrl-evaluation';
import { QrlSubmission } from '@common/qrl-submission';
import { Question as CommonQuestion } from '@common/question';
import { QuestionPayload } from '@common/question-payload';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Subject, Subscription } from 'rxjs';
import { Socket } from 'socket.io';

@Injectable()
export class GameService implements OnModuleInit, OnModuleDestroy {
    games: Map<string, Game> = new Map();
    private lastQcmSubmissionSubjects: Map<string, Subject<void>> = new Map();
    private clearInactiveGamesInterval: NodeJS.Timeout;

    constructor(private moduleRef: ModuleRef) {}

    get questionService(): QuestionService {
        return this.moduleRef.get(QuestionService);
    }

    get quizService(): QuizService {
        return this.moduleRef.get(QuizService);
    }

    get timerService(): TimerService {
        return this.moduleRef.get(TimerService);
    }

    onModuleInit() {
        this.clearInactiveGamesInterval = setInterval(this.clearInactiveGames.bind(this), CONSTANTS.clearInactiveGamesDelayMs);
    }

    onModuleDestroy() {
        clearInterval(this.clearInactiveGamesInterval);
    }

    async createGame(client: Socket, quizId: string): Promise<string> {
        let quiz: Quiz;

        if (quizId) {
            quiz = await this.quizService.getQuizById(quizId);
        } else {
            quiz = new Quiz();
            quiz.title = 'Mode Aléatoire';
            const qcmQuestions = (await this.questionService.getAllQuestions()).filter((x) => x.type.trim().toUpperCase() === 'QCM');
            quiz.duration = 20;

            if (qcmQuestions.length < CONSTANTS.randomQuestionCount) {
                throw new Error("Il n'existe pas assez de questions de type QCM dans la banque de questions pour faire une partie en mode aléatoire");
            }

            const shuffledQuestions = qcmQuestions.sort(() => {
                return Math.random() - CONSTANTS.randomExpectation; // to have 1/2 chance to be negative
            });
            quiz.questions = shuffledQuestions.slice(0, CONSTANTS.randomQuestionCount);
        }

        if (!quiz) {
            throw new Error(`Aucun quiz ne correspond a l'identifiant ${quizId}`);
        }

        let pin = generateRandomPin();

        while (this.games.has(pin)) {
            pin = generateRandomPin();
        }

        const game = new Game(pin, quiz, client);
        this.games.set(pin, game);

        return game.pin;
    }

    joinGame(client: Socket, pin: string, username: string): Player {
        const game = this.getGame(pin);
        const clientPlayer = new ClientPlayer(client, username);
        const clientPlayers = Array.from(game.clientPlayers.values());

        if (client.id !== game.organizer.id) {
            this.ensureGameIsOpen(game);
            this.ensureNotAlreadyInGame(game, client);
            this.ensureValidUsername(username);
            this.ensureNotBannedUsername(clientPlayers, username);
            this.ensureUniqueUsername(clientPlayers, username);
        }

        game.clientPlayers.set(client.id, clientPlayer);

        return clientPlayer.player;
    }

    evaluateChoices(client: Socket, pin: string): QcmEvaluation {
        const game = this.getGame(pin);
        const question = game.currentQuestion;
        this.ensureQcmQuestion(question);

        const submission = this.getOrCreateSubmission(client, game);
        this.ensureNotAlreadySubmitted(submission);

        submission.isFinal = true;

        const isCorrect = this.isGoodAnswer(question, submission);
        const isFirst = this.isFirstSubmission(game) && this.timerService.getTimer(pin).time !== 0;
        const isLast = this.isLastQcmSubmission(game);

        const score = this.calculateScore(question.points, isCorrect, isFirst);

        const player = game.clientPlayers.get(client.id).player;
        player.score += score;
        player.speedAwardCount += isCorrect && isFirst ? 1 : 0;

        const evaluation = {
            player,
            correctAnswers: game.currentQuestion.choices.filter((x) => x.isCorrect),
            score,
            isFirstCorrect: isFirst && isCorrect,
            isLast,
        };

        if (isLast) {
            this.lastQcmSubmissionSubjects.get(pin)?.next();
        }

        return evaluation;
    }

    startGame(client: Socket, pin: string): QuestionPayload {
        const game = this.getGame(pin);

        if (!this.isOrganizer(game, client.id)) {
            throw new Error(`Vous n'êtes pas organisateur de la partie ${pin}`);
        }

        if (!game.clientPlayers.size) {
            throw new Error('Vous ne pouvez pas débuter une partie sans joueurs');
        }

        game.state = GameState.Running;

        return {
            question: game.currentQuestion as CommonQuestion,
            isLast: game.currentQuestionIndex === game.quiz.questions.length - 1,
        };
    }

    cancelGame(client: Socket, pin: string): string {
        const game = this.getGame(pin);

        const isOrganizer = this.isOrganizer(game, client.id);
        const gameHasPlayersLeft = Array.from(game.clientPlayers.values()).some((player) => player.player.state === PlayerState.Playing);

        if (gameHasPlayersLeft && !isOrganizer) {
            throw new Error(`Vous n'êtes pas organisateur de la partie ${pin}`);
        }

        game.state = GameState.Ended;

        return gameHasPlayersLeft ? "L'organisateur a quitté la partie" : 'Tous les joueurs ont quitté la partie';
    }

    toggleGameLock(client: Socket, pin: string): GameState {
        const game = this.getGame(pin);

        if (!this.isOrganizer(game, client.id)) {
            throw new Error(`Vous n'êtes pas organisateur de la partie ${pin}`);
        }

        switch (game.state) {
            case GameState.Opened:
                game.state = GameState.Closed;
                break;
            case GameState.Closed:
                game.state = GameState.Opened;
                break;
            default:
                throw new Error('La partie ne peut pas être verouillée/déverouillée');
        }

        return game.state;
    }

    nextQuestion(client: Socket, pin: string): QuestionPayload {
        const game = this.getGame(pin);
        if (!this.isOrganizer(game, client.id)) {
            throw new Error(`Vous n'êtes pas organisateur de la partie ${pin}`);
        }

        game.loadNextQuestion();

        return {
            question: game.currentQuestion as CommonQuestion,
            isLast: game.currentQuestionIndex === game.quiz.questions.length - 1,
        };
    }

    qcmToggleChoice(client: Socket, pin: string, choiceIndex: number): BarchartSubmission {
        const game = this.getGame(pin);
        const submission = this.getOrCreateSubmission(client, game);
        submission.choices[choiceIndex].isSelected = !submission.choices[choiceIndex].isSelected;
        return { clientId: client.id, index: choiceIndex, isSelected: submission.choices[choiceIndex].isSelected };
    }

    qrlSubmit(client: Socket, pin: string, answer: string): QrlSubmission {
        const game = this.getGame(pin);

        if (game.currentQuestionQrlSubmissions.has(client.id)) {
            throw new Error('Vous avez déjà soumis votre réponse pour cette question');
        }

        const submission: QrlSubmission = { clientId: client.id, answer };
        game.currentQuestionQrlSubmissions.set(client.id, submission);

        const isLast = game.currentQuestionQrlSubmissions.size >= game.getActivePlayers().length;

        submission.isLast = isLast;

        return submission;
    }

    qrlInputChange(client: Socket, pin: string, isTyping: boolean): BarchartSubmission {
        const game = this.getGame(pin);
        const clientPlayers = game.clientPlayers;

        clientPlayers.get(client.id).player.isTyping = isTyping;
        if (isTyping) {
            clientPlayers.get(client.id).player.hasInteracted = true;
        }

        return { clientId: client.id, index: isTyping ? 1 : 0, isSelected: true };
    }

    qrlEvaluate(socketId: string, pin: string, grade: Grade): QrlEvaluation {
        const game = this.getGame(pin);
        const question = game.currentQuestion;
        const player = game.clientPlayers.get(socketId).player;

        const evalQrl: QrlEvaluation = {
            player,
            isLast: false,
            score: 0,
            grade,
        };
        game.currentQuestionQrlEvaluations.set(socketId, evalQrl);
        const isLast = game.currentQuestionQrlEvaluations.size === game.getActivePlayers().length;

        evalQrl.isLast = isLast;
        evalQrl.score = (question.points * evalQrl.grade) / CONSTANTS.percentageDivider;
        player.score += evalQrl.score;

        game.currentQuestionQrlEvaluations.set(socketId, evalQrl);

        return evalQrl;
    }

    endGame(client: Socket, pin: string): void {
        const game = this.getGame(pin);

        if (!this.isOrganizer(game, client.id)) {
            throw new Error(`Vous n'êtes pas organisateur de la partie ${pin}`);
        }

        game.state = GameState.Ended;
    }

    getGame(pin: string): Game | null {
        const game = this.games.get(pin);

        if (!game) {
            throw new Error(`Aucune partie ne correspond au pin ${pin}`);
        }

        return game;
    }

    getOrganizer(pin: string): Socket {
        const game = this.games.get(pin);

        if (!game) {
            throw new Error(`Aucune partie ne correspond au pin ${pin}`);
        }

        return game.organizer;
    }

    isOrganizer(game: Game, clientId: string): boolean {
        return game.organizer.id === clientId;
    }

    onLastQcmSubmission(pin: string, callback: () => void): Subscription {
        const subject = new Subject<void>();
        this.lastQcmSubmissionSubjects.set(pin, subject);

        return subject.subscribe(callback);
    }

    disconnect(client: Socket): string[] {
        const games = Array.from(this.games.values());
        const toCancel = games.filter((game) => game.organizer.id === client.id).map((game) => game.pin);

        return toCancel;
    }

    private clearInactiveGames() {
        Array.from(this.games.entries())
            .filter(([pin, game]) => game.state === GameState.Ended && this.games.get(pin).getActivePlayers().length === 0)
            .forEach(([pin]) => {
                this.games.delete(pin);
            });
    }

    private isGoodAnswer(question: Question, submission: QcmSubmission): boolean {
        const correctAnswersIndices = new Set(
            question.choices.reduce((indices, choice, index) => {
                if (choice.isCorrect) {
                    indices.push(index);
                }

                return indices;
            }, []),
        );
        const selectedAnswersIndices = new Set(submission.choices.filter((x) => x.isSelected).map((x) => x.payload));

        return (
            correctAnswersIndices.size === selectedAnswersIndices.size &&
            Array.from(correctAnswersIndices).every((x) => selectedAnswersIndices.has(x))
        );
    }

    private getOrCreateSubmission(client: Socket, game: Game) {
        if (!game.currentQuestionQcmSubmissions.has(client.id)) {
            game.currentQuestionQcmSubmissions.set(client.id, {
                clientId: client.id,
                choices: game.currentQuestion.choices.map((_, index) => {
                    return { payload: index, isSelected: false };
                }),
                isFinal: false,
            });
        }

        return game.currentQuestionQcmSubmissions.get(client.id);
    }

    private ensureNotAlreadyInGame(game: Game, client: Socket) {
        const clientPlayer = game.clientPlayers.get(client.id);
        if (clientPlayer?.player?.state === PlayerState.Playing) {
            throw new Error('Vous êtes déjà dans cette partie');
        }
    }

    private ensureValidUsername(username: string) {
        if (username.trim().toLowerCase() === 'organisateur') {
            throw new Error('Le nom "Organisateur" est réservé');
        }
    }

    private ensureGameIsOpen(game: Game) {
        if (game.state !== GameState.Opened) {
            throw new Error(`La partie ${game.pin} n'est pas ouverte`);
        }
    }

    private ensureUniqueUsername(clientPlayers: ClientPlayer[], username: string) {
        const usernameExists = clientPlayers.some(
            (x) => x.player.username.toLowerCase() === username.trim().toLowerCase() && x.player.state === PlayerState.Playing,
        );
        if (usernameExists) {
            throw new Error(`Le nom d'utilisateur "${username}" est déjà pris`);
        }
    }

    private ensureNotBannedUsername(clientPlayers: ClientPlayer[], username: string) {
        const usernameBanned = clientPlayers.some(
            (x) => x.player.username.toLowerCase() === username.trim().toLowerCase() && x.player.state === PlayerState.Banned,
        );
        if (usernameBanned) {
            throw new Error(`Le nom d'utilisateur "${username}" est banni.`);
        }
    }

    private ensureQcmQuestion(question: Question) {
        if (question.type !== 'QCM') {
            throw new Error("La question n'est pas de type QCM");
        }
    }

    private ensureNotAlreadySubmitted(submission: QcmSubmission) {
        if (submission.isFinal) {
            throw new Error('Vous avez déjà soumis vos choix pour cette question');
        }
    }

    private isFirstSubmission(game: Game): boolean {
        return Array.from(game.currentQuestionQcmSubmissions.values()).filter((x) => x.isFinal).length === 1;
    }

    private isLastQcmSubmission(game: Game): boolean {
        const activePlayers = game.getActivePlayers();
        return (
            Array.from(game.currentQuestionQcmSubmissions.entries()).filter(([clientId, submission]) => {
                return activePlayers.some((activePlayer) => activePlayer.socket.id === clientId) && submission.isFinal;
            }).length >= activePlayers.length
        );
    }

    private calculateScore(questionPoints: number, isCorrect: boolean, isFirst: boolean): number {
        let score = isCorrect ? questionPoints : CONSTANTS.noPoints;
        score *= isFirst ? CONSTANTS.bonusMultiplier : CONSTANTS.noBonusMultiplier;
        return score;
    }
}
