import { ClientPlayer } from '@app/classes/client-player';
import { Game } from '@app/classes/game';
import { generateRandomPin } from '@app/helpers/pin';
import { DisconnectPayload } from '@app/interfaces/disconnect-payload';
import { GameEventPayload } from '@app/interfaces/game-event-payload';
import { Question } from '@app/model/database/question';
import { QuizService } from '@app/services/quiz/quiz.service';
import { EvaluationPayload } from '@common/evaluation-payload';
import { GameState } from '@common/game-state';
import { JoinGamePayload } from '@common/join-game-payload';
import { Player } from '@common/player';
import { PlayerState } from '@common/player-state';
import { Submission } from '@common/submission';
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

const NO_POINTS = 0;
const NO_BONUS_MULTIPLIER = 1;
const BONUS_MULTIPLIER = 1.2;

@Injectable()
export class GameService {
    private activeGames: Map<string, Game> = new Map();

    constructor(private readonly quizService: QuizService) {}

    async createGame(client: Socket, quizId: string): Promise<GameEventPayload<string>> {
        const quiz = await this.quizService.getQuizById(quizId);

        if (!quiz) {
            Promise.reject(`No Quiz with ID ${quizId} exists`);
        }

        let pin = generateRandomPin();

        while (this.activeGames.has(pin)) {
            pin = generateRandomPin();
        }

        const game = new Game(pin, quiz, client);
        this.activeGames.set(pin, game);

        return {
            pin: game.pin,
            organizer: game.organizer,
            client,
            data: game.pin,
        };
    }

    joinGame(client: Socket, pin: string, username: string): GameEventPayload<JoinGamePayload> {
        const game = this.getGame(pin);
        const player = new ClientPlayer(client, username);

        if (Array.from(game.clientPlayers.values()).some((x) => x.player.username === username && x.player.state === PlayerState.Playing)) {
            throw new Error(`Username ${username} is already taken for game ${pin}`);
        }

        game.clientPlayers.set(client.id, player);

        const players = Array.from(game.clientPlayers.values()).map((x) => x.player);
        const payload = { pin, players, chatlogs: game.chatlogs };

        return {
            pin: game.pin,
            organizer: game.organizer,
            client,
            data: payload,
        };
    }

    playerAbandon(client: Socket, pin: string): GameEventPayload<Player> {
        const game = this.getGame(pin);
        const clientPlayer = game.clientPlayers.get(client.id);

        clientPlayer.player.state = PlayerState.Abandonned;

        return {
            pin: game.pin,
            organizer: game.organizer,
            client,
            data: clientPlayer.player,
        };
    }

    playerBan(client: Socket, pin: string, username: string): GameEventPayload<Player> {
        const game = this.getGame(pin);

        if (!this.isOrganizer(game, client.id)) {
            throw new Error(`Client ${client.id} can't ban in game ${pin}`);
        }

        const clientPlayer = Array.from(game.clientPlayers.values()).find((x) => {
            return x.player.username.toLowerCase() === username.toLowerCase() && x.player.state === PlayerState.Playing;
        });

        if (clientPlayer) {
            clientPlayer.player.state = PlayerState.Banned;
        }

        return {
            pin: game.pin,
            organizer: game.organizer,
            client,
            data: clientPlayer.player,
        };
    }

    evaluateChoices(client: Socket, pin: string): GameEventPayload<EvaluationPayload> {
        const game = this.getGame(pin);

        if (game.submissions.get(client.id).isFinal) {
            throw new Error(`Client ${client.id} already submitted their choices`);
        }

        game.submissions.get(client.id).isFinal = true;

        const question = game.quiz.questions[game.currentQuestionIndex];
        const submission = game.submissions.get(client.id);

        const isGoodAnswer = this.isGoodAnswer(question, submission);
        const isFirstGoodEvaluation =
            isGoodAnswer && Array.from(game.submissions.values()).filter((x) => x.isFinal && this.isGoodAnswer(question, x)).length === 1;
        const isLastEvaluation = Array.from(game.submissions.values()).filter((x) => x.isFinal).length === game.clientPlayers.size;

        let score = isGoodAnswer ? question.points : NO_POINTS;
        score *= isFirstGoodEvaluation ? BONUS_MULTIPLIER : NO_BONUS_MULTIPLIER;
        const payload = {
            correctAnswers: question.choices.filter((x) => x.isCorrect),
            score,
            isFirstGoodEvaluation,
            isLastEvaluation,
        };

        return {
            pin: game.pin,
            organizer: game.organizer,
            client,
            data: payload,
        };
    }

    disconnect(client: Socket): DisconnectPayload {
        const toCancel = [];
        const toAbandon = [];

        // for each matched organizer, remove all organizer games
        Array.from(this.activeGames.entries())
            .filter(([, game]) => game.organizer.id === client.id)
            .forEach(([pin]) => {
                toCancel.push(pin);
            });

        // for each games, remove matching players
        Array.from(this.activeGames.entries())
            .filter(([, game]) => Array.from(game.clientPlayers.values()).some((x) => x.socket.id === client.id))
            .forEach(([pin]) => {
                toAbandon.push(pin);
            });

        return { toCancel, toAbandon };
    }

    cancelGame(client: Socket, pin: string): GameEventPayload<string> {
        const game = this.getGame(pin);
        this.activeGames.delete(pin);

        const isOrganizer = this.isOrganizer(game, client.id);
        const gameHasPlayersLeft = Array.from(game.clientPlayers.values()).some((player) => player.player.state === PlayerState.Playing);
        if (gameHasPlayersLeft && !isOrganizer) {
            throw new Error(`Vous n'êtes pas organisateur de la partie ${pin}`);
        }
        const payload: GameEventPayload<string> = {
            pin: game.pin,
            organizer: game.organizer,
            client,
            data: gameHasPlayersLeft ? 'Organizor canceled the game' : 'All the player left. Game has been canceled',
        };

        return payload;
    }

    toggleGameLock(client: Socket, pin: string): GameEventPayload<GameState> {
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

        return {
            pin: game.pin,
            client,
            organizer: game.organizer,
            data: game.state,
        };
    }

    nextQuestion(client: Socket, pin: string): GameEventPayload<Question> {
        const game = this.getGame(pin);
        if (!this.isOrganizer(game, client.id)) {
            throw new Error(`Vous n'êtes pas organisateur de la partie ${pin}`);
        }

        game.submissions.clear();
        game.currentQuestionIndex++;

        return { pin: game.pin, client, organizer: game.organizer, data: game.quiz.questions[game.currentQuestionIndex] };
    }

    toggleSelectChoice(client: Socket, pin: string, choiceIndex: number): GameEventPayload<Submission> {
        const game = this.getGame(pin);
        let playerSubmission = game.submissions.get(client.id);
        if (!playerSubmission) {
            playerSubmission = {
                choices: game.quiz.questions[game.currentQuestionIndex].choices.map((_, index) => {
                    return { index, isSelected: false };
                }),
                isFinal: false,
            };
        }
        playerSubmission.choices[choiceIndex].isSelected = !playerSubmission.choices[choiceIndex].isSelected;

        return {
            pin: game.pin,
            client,
            organizer: game.organizer,
            data: playerSubmission,
        };
    }

    private getGame(pin: string): Game {
        const game = this.activeGames.get(pin);

        if (!game) {
            throw new Error(`No game with pin ${pin} exists`);
        }

        return game;
    }

    private isOrganizer(game: Game, clientId: string) {
        return game.organizer.id === clientId;
    }

    private isGoodAnswer(question: Question, submission: Submission) {
        const correctAnswers = question.choices.filter((x) => x.isCorrect);
        const correctAnswerTexts: Set<string> = new Set(correctAnswers.map((x) => x.text));
        const selectedAnswerTexts: Set<string> = new Set(Array.from(submission.selectedChoices.values()).map((x) => x.text));

        return correctAnswerTexts.size === selectedAnswerTexts.size && Array.from(correctAnswerTexts).every((x) => selectedAnswerTexts.has(x));
    }
}
