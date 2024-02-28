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
    currentQuestionIndex: number = 0;
    clientPlayers: Map<string, ClientPlayer> = new Map();
    submissions: Map<string, Submission> = new Map();

    constructor(pin: string, quiz: Quiz, organizer: Socket) {
        this.pin = pin;
        this.quiz = quiz;
        this.organizer = organizer;
        this.state = GameState.Opened;
    }
}
