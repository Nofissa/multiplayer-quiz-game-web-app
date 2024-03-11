import { ClientPlayer } from '@app/classes/client-player';
import { Game } from '@app/classes/game';
import { generateRandomPin } from '@app/helpers/pin';
import { DisconnectPayload } from '@app/interfaces/disconnect-payload';
import { Question } from '@app/model/database/question';
import { QuizService } from '@app/services/quiz/quiz.service';
import { Evaluation } from '@common/evaluation';
import { GameState } from '@common/game-state';
import { PlayerState } from '@common/player-state';
import { Submission } from '@common/submission';
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Player } from '@common/player';

const NO_POINTS = 0;
const NO_BONUS_MULTIPLIER = 1;
const BONUS_MULTIPLIER = 1.2;

@Injectable()
export class GameService {
    private games: Map<string, Game> = new Map();

    constructor(private readonly quizService: QuizService) {}

    async createGame(client: Socket, quizId: string): Promise<string> {
        const quiz = await this.quizService.getQuizById(quizId);

        if (!quiz) {
            Promise.reject(`Aucun quiz ne correspond a l'identifiant ${quizId}`);
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

    playerAbandon(client: Socket, pin: string): ClientPlayer {
        const game = this.getGame(pin);
        const clientPlayer = game.clientPlayers.get(client.id);

        clientPlayer.player.state = PlayerState.Abandonned;

        return clientPlayer;
    }

    playerBan(client: Socket, pin: string, username: string): ClientPlayer {
        const game = this.getGame(pin);

        if (!this.isOrganizer(game, client.id)) {
            throw new Error(`Vous n'êtes pas organisateur de la partie ${pin}`);
        }

        const clientPlayer = Array.from(game.clientPlayers.values()).find((x) => {
            return x.player.username.toLowerCase() === username.toLowerCase() && x.player.state === PlayerState.Playing;
        });

        if (clientPlayer) {
            clientPlayer.player.state = PlayerState.Banned;
        }

        return clientPlayer;
    }

    evaluateChoices(client: Socket, pin: string): Evaluation {
        const game = this.getGame(pin);
        const submission = this.getOrCreateSubmission(client, game);

        if (submission.isFinal) {
            throw new Error('Vous avez déjà soumis vos choix pour cette question');
        }

        submission.isFinal = true;

        const question = game.currentQuestion;

        const gameSubmissions = Array.from(game.currentQuestionSubmissions.values());
        const isGoodAnswer = this.isGoodAnswer(question, submission);
        const isFirstEvaluation = gameSubmissions.filter((x) => x.isFinal).length === 1;
        const isLastEvaluation = gameSubmissions.filter((x) => x.isFinal).length === game.clientPlayers.size;

        let score = isGoodAnswer ? question.points : NO_POINTS;
        score *= isFirstEvaluation ? BONUS_MULTIPLIER : NO_BONUS_MULTIPLIER;
        const payload = {
            correctAnswers: question.choices.filter((x) => x.isCorrect),
            score,
            isFirstGoodEvaluation: isGoodAnswer && isFirstEvaluation,
            isLastEvaluation,
        };
        const player = game.clientPlayers.get(client.id).player;
        player.score += payload.score;
        player.speedAwardCount += payload.isFirstGoodEvaluation ? 1 : 0;

        return payload;
    }

    cancelGame(client: Socket, pin: string): string {
        const game = this.getGame(pin);
        this.games.delete(pin);

        const isOrganizer = this.isOrganizer(game, client.id);
        const gameHasPlayersLeft = Array.from(game.clientPlayers.values()).some((player) => player.player.state === PlayerState.Playing);

        if (gameHasPlayersLeft && !isOrganizer) {
            throw new Error(`Vous n'êtes pas organisateur de la partie ${pin}`);
        }

        return gameHasPlayersLeft ? 'Organizor canceled the game' : 'All the player left. Game has been canceled';
    }

    toggleGameLock(client: Socket, pin: string): GameState {
        const game = this.getGame(pin);

        const isOrganizer = this.isOrganizer(game, client.id);

        if (!isOrganizer) {
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

    nextQuestion(client: Socket, pin: string): Question {
        const game = this.getGame(pin);
        if (!this.isOrganizer(game, client.id)) {
            throw new Error(`Vous n'êtes pas organisateur de la partie ${pin}`);
        }

        game.loadNextQuestion();

        return game.currentQuestion;
    }

    toggleSelectChoice(client: Socket, pin: string, choiceIndex: number): Submission[] {
        const game = this.getGame(pin);
        const submission = this.getOrCreateSubmission(client, game);
        submission.choices[choiceIndex].isSelected = !submission.choices[choiceIndex].isSelected;

        return Array.from(game.currentQuestionSubmissions.values());
    }

    getGame(pin: string): Game {
        const game = this.games.get(pin);

        if (!game) {
            throw new Error(`Aucune partie ne correspond au pin ${pin}`);
        }

        return game;
    }

    disconnect(client: Socket): DisconnectPayload {
        const toCancel = [];
        const toAbandon = [];
        const gameEntries = Array.from(this.games.entries());

        gameEntries
            .filter(([, game]) => game.organizer.id === client.id)
            .forEach(([pin]) => {
                toCancel.push(pin);
            });

        gameEntries
            .filter(([, game]) => Array.from(game.clientPlayers.values()).some((x) => x.socket.id === client.id))
            .forEach(([pin]) => {
                toAbandon.push(pin);
            });

        return { toCancel, toAbandon };
    }

    private isOrganizer(game: Game, clientId: string): boolean {
        return game.organizer.id === clientId;
    }

    private isGoodAnswer(question: Question, submission: Submission): boolean {
        const correctAnswersIndices = new Set(question.choices.filter((x) => x.isCorrect).map((_, index) => index));
        const selectedAnswersIndices = new Set(submission.choices.filter((x) => x.isSelected).map((x) => x.index));

        return (
            correctAnswersIndices.size === selectedAnswersIndices.size &&
            Array.from(selectedAnswersIndices).every((x) => selectedAnswersIndices.has(x))
        );
    }

    private getOrCreateSubmission(client: Socket, game: Game) {
        if (!game.currentQuestionSubmissions.has(client.id)) {
            game.currentQuestionSubmissions.set(client.id, {
                choices: game.currentQuestion.choices.map((_, index) => {
                    return { index, isSelected: false };
                }),
                isFinal: false,
            });
        }

        return game.currentQuestionSubmissions.get(client.id);
    }
}
