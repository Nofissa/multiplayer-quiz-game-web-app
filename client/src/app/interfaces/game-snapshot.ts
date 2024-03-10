import { Player } from '@common/player';
import { Chatlog } from '@common/chatlog';
import { Submission } from '@common/submission';
import { Question } from './question';

export interface GameSnapshot {
    players: Player[];
    chatlogs: Chatlog[];
    selfPlayer: Player | null;
    currentQuestionIndex: number;
    questions: Question[];
    questionSubmissions: Submission[][];
}
