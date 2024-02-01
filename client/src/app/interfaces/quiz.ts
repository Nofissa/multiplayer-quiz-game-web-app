import { Question } from './question';

export interface Quiz {
    title: string;
    description: string;
    questions: Question[];
    isHidden: boolean;
    lastModified: Date;
    _id: string;
}
