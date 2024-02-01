import { Choice } from './choice';

export interface Question {
    type: string;
    text: string;
    points: number;
    choices: Choice[];
}
