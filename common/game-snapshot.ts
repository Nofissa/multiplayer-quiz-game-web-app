import { Player } from './player';
import { Chatlog } from './chatlog';
import { Submission } from './submission';
import { GameState } from './game-state';
import { Quiz } from './quiz';

export interface GameSnapshot {
    players: Player[];
    chatlogs: Chatlog[];
    quiz: Quiz;
    state: GameState;
    currentQuestionIndex: number;
    questionSubmissions: Map<string, Submission>[];
}
