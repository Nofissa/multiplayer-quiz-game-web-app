import { ClientPlayer } from '@app/classes/client-player';
import { Game } from '@app/classes/game';
import { generateRandomPin } from '@app/helpers/pin';
import { DisconnectPayload } from '@app/interfaces/disconnect-payload';
import { Question } from '@app/model/database/question';
import { Quiz } from '@app/model/database/quiz';
import { QuizService } from '@app/services/quiz/quiz.service';
import { QuestionService } from '@app/services/question/question.service';
import { TimerService } from '@app/services/timer/timer.service';
import { GameState } from '@common/game-state';
import { Player } from '@common/player';
import { PlayerState } from '@common/player-state';
import { QcmEvaluation } from '@common/qcm-evaluation';
import { QrlEvaluation } from '@common/qrl-evaluation';
import { QrlSubmission } from '@common/qrl-submission';
import { Question as CommonQuestion } from '@common/question';
import { QuestionPayload } from '@common/question-payload';
import { Submission } from '@common/submission';
import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Socket } from 'socket.io';

const PERCENTAGE_DIVIDER = 100;
const NO_POINTS = 0;
const NO_BONUS_MULTIPLIER = 1;
const BONUS_MULTIPLIER = 1.2;
const RANDOM_MODE_QUESTION_COUNT = 5;
const RANDOM_EXPECTATION = 0.5;

@Injectable()
export class GameService {
    games: Map<string, Game> = new Map();

    constructor(private readonly moduleRef: ModuleRef) {}

    get quizService(): QuizService {
        return this.moduleRef.get(QuizService);
    }

    get questionService(): QuestionService {
        return this.moduleRef.get(QuestionService);
    }

    get timerService(): TimerService {
        return this.moduleRef.get(TimerService);
    }

    async createGame(client: Socket, quizId?: string): Promise<string> {
        let quiz: Quiz;

        if (quizId) {
            quiz = await this.quizService.getQuizById(quizId);
        } else {
            quiz = new Quiz();
            quiz.title = 'mode aléatoire';
            const questions = await this.questionService.getAllQuestions();
            quiz.duration = 20;

            if (questions.length < RANDOM_MODE_QUESTION_COUNT) {
                throw new Error("Il n'existe pas assez de questions dans la banque de questions pour faire une partie en mode aléatoire");
            }

            const shuffledQuestions = questions.slice().sort(() => Math.random() - RANDOM_EXPECTATION); // to have 1/2 chance to be negative
            quiz.questions = shuffledQuestions.slice(0, RANDOM_MODE_QUESTION_COUNT);
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

        if (game.state !== GameState.Opened) {
            throw new Error(`La partie ${pin} n'est pas ouverte`);
        }

        if (game.clientPlayers.has(client.id) && game.clientPlayers.get(client.id)?.player.state === PlayerState.Playing) {
            throw new Error('Vous êtes déjà dans cette partie');
        }

        if (username.toLowerCase() === 'organisateur') {
            throw new Error('Le nom "Organisateur" est réservé');
        }

        if (clientPlayers.some((x) => x.player.username.toLowerCase() === username.toLowerCase() && x.player.state === PlayerState.Banned)) {
            throw new Error(`Le nom d'utilisateur "${username}" banni`);
        }

        if (clientPlayers.some((x) => x.player.username.toLowerCase() === username.toLowerCase() && x.player.state === PlayerState.Playing)) {
            throw new Error(`Le nom d'utilisateur "${username}" est déjà pris`);
        }

        game.clientPlayers.set(client.id, clientPlayer);

        return clientPlayer.player;
    }

    evaluateChoices(client: Socket, pin: string): QcmEvaluation {
        const game = this.getGame(pin);
        const submission = this.getOrCreateSubmission(client, game);

        if (submission.isFinal) {
            throw new Error('Vous avez déjà soumis vos choix pour cette question');
        }

        submission.isFinal = true;

        const question = game.currentQuestion;

        const gameSubmissions = Array.from(game.currentQuestionQcmSubmissions.values());
        const isCorrect = this.isGoodAnswer(question, submission);
        const isFirst = gameSubmissions.filter((x) => x.isFinal).length === 1 && this.timerService.getTimer(pin)?.time !== 0;
        const isLast =
            gameSubmissions.filter((x) => x.isFinal).length >=
            Array.from(game.clientPlayers.values()).filter((x) => x.player.state === PlayerState.Playing).length;

        let score = isCorrect ? question.points : NO_POINTS;
        score *= isFirst ? BONUS_MULTIPLIER : NO_BONUS_MULTIPLIER;

        const player = game.clientPlayers.get(client.id).player;
        player.score += score;
        player.speedAwardCount += isCorrect && isFirst ? 1 : 0;

        const evaluation: QcmEvaluation = {
            player,
            correctAnswers: question.choices.filter((x) => x.isCorrect),
            score,
            isFirstCorrect: isFirst && isCorrect,
            isLast,
        };

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

    qcmToggleChoice(client: Socket, pin: string, choiceIndex: number): Submission[] {
        const game = this.getGame(pin);
        const submission = this.getOrCreateSubmission(client, game);
        submission.choices[choiceIndex].isSelected = !submission.choices[choiceIndex].isSelected;

        return Array.from(game.currentQuestionQcmSubmissions.values());
    }

    qrlSubmit(client: Socket, pin: string, answer: string): QrlSubmission {
        const game = this.getGame(pin);

        if (game.currentQuestionQrlSubmissions.has(client.id)) {
            throw new Error('Vous avez déjà soumis votre réponse pour cette question');
        }

        const submission: QrlSubmission = { clientId: client.id, answer };
        game.currentQuestionQrlSubmissions.set(client.id, submission);

        return submission;
    }

    qrlInputChange(client: Socket, pin: string, isTyping: boolean): boolean[] {
        const game = this.getGame(pin);
        const clientPlayers = game.clientPlayers;

        clientPlayers.get(client.id).player.isTyping = isTyping;
        if (isTyping) {
            clientPlayers.get(client.id).player.hasInteracted = true;
        }

        return Array.from(clientPlayers.values()).map((x) => x.player.isTyping);
    }

    qrlEvaluate(client: Socket, pin: string, qrlEvaluation: QrlEvaluation): QrlEvaluation {
        const game = this.getGame(pin);
        const question = game.currentQuestion;

        const isLast =
            Array.from(game.currentQuestionQrlSubmissions.values()).length ===
            Array.from(game.clientPlayers.values()).filter((x) => x.player.state === PlayerState.Playing).length;

        qrlEvaluation.score = (question.points * qrlEvaluation.grade) / PERCENTAGE_DIVIDER;
        qrlEvaluation.isLast = isLast;

        const player = game.clientPlayers.get(client.id).player;
        player.score += qrlEvaluation.score;

        return qrlEvaluation;
    }
    endGame(client: Socket, pin: string): void {
        const game = this.getGame(pin);

        if (!this.isOrganizer(game, client.id)) {
            throw new Error(`Vous n'êtes pas organisateur de la partie ${pin}`);
        }
    }

    disconnect(client: Socket): DisconnectPayload {
        const games = Array.from(this.games.values());

        const toCancel = games
            .filter((game) => game.organizer.id === client.id && (game.state === GameState.Opened || game.state === GameState.Closed))
            .map((game) => game.pin);

        const toEnd = games
            .filter((game) => game.organizer.id === client.id && (game.state === GameState.Paused || game.state === GameState.Running))
            .map((game) => game.pin);

        return { toCancel, toEnd };
    }

    getGame(pin: string): Game {
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

    isGoodAnswer(question: Question, submission: Submission): boolean {
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

    getOrCreateSubmission(client: Socket, game: Game) {
        if (!game.currentQuestionQcmSubmissions.has(client.id)) {
            game.currentQuestionQcmSubmissions.set(client.id, {
                choices: game.currentQuestion.choices.map((_, index) => {
                    return { payload: index, isSelected: false };
                }),
                isFinal: false,
            });
        }

        return game.currentQuestionQcmSubmissions.get(client.id);
    }
}
