import { Choice } from '@common/choice';

export interface Submission {
    playerUsername: string;
    selectedChoices: Choice[];
    timestamp: Date;
}
