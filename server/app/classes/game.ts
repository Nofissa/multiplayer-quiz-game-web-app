import { Question } from '@app/model/database/question';
import { Quiz } from '@app/model/database/quiz';
import { Chatlog } from '@common/chatlog';
import { GameState } from '@common/game-state';
import { QrlEvaluation } from '@common/qrl-evaluation';
import { QrlSubmission } from '@common/qrl-submission';
import { Submission as QcmSubmission } from '@common/submission';
import { Socket } from 'socket.io';
import { ClientPlayer } from './client-player';

export class Game {
    pin: string;
    isRandom: boolean;
    quiz: Quiz;
    currentQuestionIndex: number = 0;
    qcmSubmissions: Map<string, QcmSubmission>[] = [];
    qrlSubmissions: Map<string, QrlSubmission>[] = [];
    qrlEvaluations: Map<string, QrlEvaluation>[] = [];
    chatlogs: Chatlog[] = [];
    clientPlayers: Map<string, ClientPlayer> = new Map();
    state: GameState;
    organizer: Socket;

    constructor(pin: string, quiz: Quiz, organizer: Socket) {
        this.pin = pin;
        this.quiz = quiz;
        this.organizer = organizer;
        this.state = GameState.Opened;
        this.qcmSubmissions.push(new Map());
        this.qrlSubmissions.push(new Map());
        this.qrlEvaluations.push(new Map());
    }

    get currentQuestion(): Question | null {
        if (this.currentQuestionIndex >= this.quiz.questions.length) {
            return null;
        }
        return this.quiz.questions[this.currentQuestionIndex];
    }

    get currentQuestionQcmSubmissions() {
        return this.qcmSubmissions[this.currentQuestionIndex];
    }

    get currentQuestionQrlSubmissions() {
        return this.qrlSubmissions[this.currentQuestionIndex];
    }

    get isRandom() {
        // Deactivated because the dangling comes from MongoDB
        // eslint-disable-next-line no-underscore-dangle
        return !this.quiz._id;
    }

    loadNextQuestion() {
        this.qcmSubmissions.push(new Map());
        this.qrlSubmissions.push(new Map());
        this.qrlEvaluations.push(new Map());
        this.currentQuestionIndex++;
    }
}
