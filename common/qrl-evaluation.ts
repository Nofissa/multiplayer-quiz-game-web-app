import { Grade } from './grade';
import { Player } from './player';

export interface QrlEvaluation {
    player: Player;
    grade: Grade;
    score?: number;
    isLast: boolean;
}
