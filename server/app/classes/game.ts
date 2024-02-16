import { GameState } from '@app/enums/game-state';
import { Chatlog } from '@app/interfaces/chatlog';
import { Organizer } from '@app/interfaces/organizer';
import { Submission } from '@app/interfaces/submission';
import { Quiz } from '@app/model/database/quiz';
import { Player } from './player';

export class Game {
    pin: string;
    quiz: Quiz;
    organizer: Organizer;
    state: GameState;
    players: Map<string, Player> = new Map();
    chatlogs: Chatlog[] = [];
    submissions: Submission[] = [];

    constructor(pin: string, quiz: Quiz, organizer: Organizer) {
        this.pin = pin;
        this.quiz = quiz;
        this.organizer = organizer;
        this.state = GameState.Opened;
    }
}
