import { GameState } from '@common/game-state';
import { Chatlog } from '@common/chatlog';
import { Submission } from '@common/submission';
import { Quiz } from '@app/model/database/quiz';
import { ClientPlayer } from './client-player';
import { Socket } from 'socket.io';

export class Game {
    pin: string;
    quiz: Quiz;
    organizer: Socket;
    state: GameState;
    chatlogs: Chatlog[] = [];
    clientPlayers: Map<string, ClientPlayer> = new Map();
    private questionSubmissions: Map<string, Submission>[] = [new Map()];
    private currentQuestionIndex: number = 0;

    constructor(pin: string, quiz: Quiz, organizer: Socket) {
        this.pin = pin;
        this.quiz = quiz;
        this.organizer = organizer;
        this.state = GameState.Opened;
    }

    get currentQuestion() {
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
