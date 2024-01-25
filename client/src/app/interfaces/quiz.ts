import { Question } from "./question";

export interface Quiz {
    titre: string;
    description: string;
    questions: Question[];
    isHidden: boolean;
    lastModified: Date;
    _id: string;
}
