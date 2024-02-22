import { Game } from '@app/classes/game';
import { Player } from '@app/classes/player';
import { GameState } from '@app/enums/game-state';
import { PlayerState } from '@app/enums/player-state';
import { generateRandomPin } from '@app/helpers/pin';
import { Organizer } from '@app/interfaces/organizer';
import { Choice, Question } from '@app/model/database/question';
import { ChoiceDto } from '@app/model/dto/choice/choice.dto';
import { QuizService } from '@app/services/quiz/quiz.service';
import { EvaluationPayload } from '@common/evaluation-payload';
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

const BONUS = 1.2;
const NO_POINTS = 0;

@Injectable()
export class GameService {
    private activeGames: Map<string, Game> = new Map();

    constructor(private readonly quizService: QuizService) {}

    async createGame(socket: Socket, quizId: string, username: string) {
        let pin = generateRandomPin();

        while (this.activeGames.has(pin)) {
            pin = generateRandomPin();
        }

        const quiz = await this.quizService.getQuizById(quizId);

        if (quiz) {
            const organizer: Organizer = { socket, username };
            const game = new Game(pin, quiz, organizer);
            if (game) {
                this.activeGames.set(pin, game);
                return game.pin;
            }
        }
        return undefined;
    }

    joinGame(socket: Socket, pin: string, username: string) {
        const player = new Player(socket, username);
        const game = this.activeGames.get(pin);
        if (game) {
            game.players.set(socket.id, player);
            this.playerListViewUpdate(pin);
            return game.players.has(socket.id);
        } else {
            return false;
        }
    }

    abandonGame(client: Socket, pin: string) {
        const game = this.activeGames.get(pin);
        if (game) {
            if (game.state !== GameState.Opened) {
                Array.from(game.players.entries())
                    .filter(([socketId]) => socketId === client.id)
                    .forEach(([socketId]) => {
                        game.players.get(socketId).state = PlayerState.Abandonned;
                    });
                this.playerListViewUpdate(pin);
                return game.players.get(client.id).state === PlayerState.Abandonned;
            } else {
                game.players.delete(client.id);
                this.playerListViewUpdate(pin);
                return !game.players.has(client.id);
            }
        }
        return false;
    }

    banFromGame(username: string, pin: string) {
        const game = this.activeGames.get(pin);
        if (game) {
            Array.from(game.players.entries())
                .filter(([, player]) => username === player.username)
                .forEach(([socketId]) => {
                    game.players.get(socketId).state = PlayerState.Banned;
                });
            this.playerListViewUpdate(pin);
            return true;
        }
        return false;
    }

    // Join Game Validators
    validatePin(pin: string) {
        return this.activeGames.has(pin);
    }

    validateUsername(pin: string, username: string) {
        const game = this.activeGames.get(pin);
        if (game) {
            return ![...game.players.entries()].some(([, value]) => value.username === username);
        }
        return true;
    }

    playerListViewUpdate(pin: string) {
        const game = this.activeGames.get(pin);
        game.players.forEach((player) => {
            player.socket.emit('updateList', JSON.stringify(game.players));
        });
    }

    disconnect(socketId: string) {
        // for each matched organizer, remove all organizer games
        Array.from(this.activeGames.entries())
            .filter(([, game]) => game.organizer.socket.id === socketId)
            .forEach(([pin]) => {
                this.activeGames.delete(pin);
            });

        // for each games, remove matching players
        Array.from(this.activeGames.values()).forEach((game) => {
            game.players.delete(socketId);
        });
    }

    evaluateChoices(chosenAnswers: ChoiceDto[], question: Question): EvaluationPayload {
        const correctAnswers: Choice[] = question.choices.filter((x) => x.isCorrect);
        const correctAnswerTexts: Set<string> = new Set(correctAnswers.map((x) => x.text));
        const chosenAnswerTexts: Set<string> = new Set(chosenAnswers.map((x) => x.text));

        const areEqualSets = correctAnswerTexts.size === chosenAnswerTexts.size && [...correctAnswerTexts].every((x) => chosenAnswerTexts.has(x));

        if (areEqualSets) {
            return { correctAnswers, score: question.points * BONUS };
        } else {
            return { correctAnswers, score: NO_POINTS };
        }
    }
}
