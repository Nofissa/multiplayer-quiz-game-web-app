import { Choice } from './choice';
import { Player } from './player';

export interface qcmEvaluation {
    player: Player;
    correctAnswers: Choice[];
    score: number;
    isFirstCorrect: boolean;
    isLast: boolean;
}
