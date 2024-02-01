import { Question } from './question';

export interface Quiz {
    id: string;
    title: string;
    description: string;
    duration: number;
    lastModification: Date;
    questions: Question[];
    isHidden: boolean | null;
    _id: string;
}
