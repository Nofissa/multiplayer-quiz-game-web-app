import { Quiz } from '@app/model/database/quiz';
import { Chatlog } from '@common/chatlog';
import { GameState } from '@common/game-state';
import { Question } from '@app/model/database/question';
import { Submission } from '@common/submission';
import { Socket } from 'socket.io';
import { ClientPlayer } from './client-player';

export class Game {
    pin: string;
    quiz: Quiz;
    organizer: Socket;
    state: GameState;
    chatlogs: Chatlog[] = [];
    clientPlayers: Map<string, ClientPlayer> = new Map();
    questionSubmissions: Map<string, Submission>[] = [new Map()];
    currentQuestionIndex: number = 0;

    constructor(pin: string, quiz: Quiz, organizer: Socket) {
        this.pin = pin;
        this.quiz = quiz;
        this.organizer = organizer;
        this.state = GameState.Opened;
    }

    get currentQuestion(): Question | null {
        if (this.currentQuestionIndex >= this.quiz.questions.length) {
            return null;
        }
        return this.quiz.questions[this.currentQuestionIndex];
    }

    get currentQuestionSubmissions() {
        return this.questionSubmissions[this.currentQuestionIndex];
    }

    get allSubmissions() {
        return this.questionSubmissions;
    }

    loadNextQuestion() {
        this.questionSubmissions.push(new Map());
        this.currentQuestionIndex++;
    }
}
