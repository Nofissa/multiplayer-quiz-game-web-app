import { Choice } from '@common/choice';

export interface Submission {
    selectedChoices: Choice[];
    isFinal: boolean;
}
