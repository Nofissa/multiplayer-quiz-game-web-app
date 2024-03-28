import { Grade } from './grade';

export interface QrlEvaluation {
    clientId: string;
    grade: Grade;
    score?: number;
    isLast?: boolean;
}
