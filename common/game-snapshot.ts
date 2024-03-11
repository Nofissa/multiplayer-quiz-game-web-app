import { Player } from './player';
import { Chatlog } from './chatlog';
import { Submission } from './submission';
import { Question } from './question';

export interface GameSnapshot {
    players: Player[];
    chatlogs: Chatlog[];
    currentQuestionIndex: number;
    questions: Question[];
    questionSubmissions: Submission[][];
}
