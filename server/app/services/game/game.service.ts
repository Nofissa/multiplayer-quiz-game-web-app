import { ClientPlayer } from '@app/classes/client-player';
import { Game } from '@app/classes/game';
import { generateRandomPin } from '@app/helpers/pin';
import { DisconnectPayload } from '@app/interfaces/disconnect-payload';
import { GameSummary } from '@app/model/database/game-summary';
import { Question } from '@app/model/database/question';
import { QuizService } from '@app/services/quiz/quiz.service';
import { GameState } from '@common/game-state';
import { Grade } from '@common/grade';
import { Player } from '@common/player';
import { PlayerState } from '@common/player-state';
import { QcmEvaluation } from '@common/qcm-evaluation';
import { QrlEvaluation } from '@common/qrl-evaluation';
import { QrlSubmission } from '@common/qrl-submission';
import { Question as CommonQuestion } from '@common/question';
import { QuestionPayload } from '@common/question-payload';
import { Submission } from '@common/submission';
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { GameSummaryService } from './game-summary.service';

const PERCENTAGE_DIVIDER = 100;
const NO_POINTS = 0;
const NO_BONUS_MULTIPLIER = 1;
const BONUS_MULTIPLIER = 1.2;

@Injectable()
export class GameService {
    games: Map<string, Game> = new Map();

    constructor(
        private gameSummaryService: GameSummaryService,
        private readonly quizService: QuizService,
    ) {}

    async createGame(client: Socket, quizId: string): Promise<string> {
        const quiz = await this.quizService.getQuizById(quizId);

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
            throw new Error(`Le nom d'utilisateur "${username}" est banni`);
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
        const isFirst = gameSubmissions.filter((x) => x.isFinal).length === 1;
        const isLast =
            gameSubmissions.filter((x) => x.isFinal).length ===
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

        const isLast =
            Array.from(game.currentQuestionQrlSubmissions.values()).length ===
            Array.from(game.clientPlayers.values()).filter((x) => x.player.state === PlayerState.Playing).length;

        submission.isLast = isLast;

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
        const isLast =
            Array.from(game.currentQuestionQrlEvaluations.values()).length ===
            Array.from(game.clientPlayers.values()).filter((x) => x.player.state === PlayerState.Playing).length;

        evalQrl.isLast = isLast;
        evalQrl.score = (question.points * evalQrl.grade) / PERCENTAGE_DIVIDER;
        player.score += evalQrl.score;

        game.currentQuestionQrlEvaluations.set(socketId, evalQrl);

        return evalQrl;
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

    getHighestScore(game: Game) {
        return Math.max(...Array.from(game.clientPlayers.values()).map((clientPlayer) => clientPlayer.player.score));
    }

    async concludeGame(pin: string): Promise<void> {
        const game = this.getGame(pin);
        const numberOfPlayers = game.clientPlayers.size;
        const bestScore = this.getHighestScore(game);
        const gameSummary: GameSummary = {
            title: game.quiz.title,
            startDate: game.startDate,
            numberOfPlayers,
            bestScore,
        };
        await this.gameSummaryService.saveGameSummary(gameSummary);
    }
}
