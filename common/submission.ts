import { Choice } from './choice';

export interface Submission {
    selectedChoices: Choice[];
    isFinal: boolean;
}
