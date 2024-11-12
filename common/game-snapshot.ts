import { Chatlog } from './chatlog';
import { GameState } from './game-state';
import { Player } from './player';
import { QcmSubmission } from './qcm-submission';
import { QrlEvaluation } from './qrl-evaluation';
import { QrlSubmission } from './qrl-submission';
import { Quiz } from './quiz';

export interface GameSnapshot {
    players: Player[];
    chatlogs: Chatlog[];
    quiz: Quiz;
    state: GameState;
    currentQuestionIndex: number;
    questionQcmSubmissions: QcmSubmission[][];
    questionQrlSubmission: QrlSubmission[][];
    questionQrlEvaluation: QrlEvaluation[][];
}
