import { Game } from '@app/classes/game';
import { Player } from '@app/classes/player';
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
        const organizer: Organizer = { socket, username };
        const game = new Game(pin, quiz, organizer);
        this.activeGames.set(pin, game);

        return game;
    }

    joinGame(socket: Socket, pin: string, username: string) {
        const player = new Player(socket, username);
        const game = this.activeGames.get(pin);
        if (game) {
            game.players.set(socket.id, player);
            return game.players.get(socket.id);
        } else {
            return 'error';
        }
    }

    validatePin(pin: string) {
        return this.activeGames.get(pin) !== undefined;
    }

    validateUsername(pin: string, username: string) {
        const game = this.activeGames.get(pin);
        if (game) {
            return ![...game.players.entries()].some(([key, value]) => value.username === username);
        }
        return false;
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
