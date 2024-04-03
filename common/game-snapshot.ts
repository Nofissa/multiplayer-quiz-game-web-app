import { Chatlog } from './chatlog';
import { GameState } from './game-state';
import { Player } from './player';
import { QrlSubmission } from './qrl-submission';
import { Quiz } from './quiz';
import { Submission } from './submission';

export interface GameSnapshot {
    players: Player[];
    chatlogs: Chatlog[];
    quiz: Quiz;
    state: GameState;
    currentQuestionIndex: number;
    questionQcmSubmissions: Submission[][];
    questionQrlSubmission: QrlSubmission[][];
}
