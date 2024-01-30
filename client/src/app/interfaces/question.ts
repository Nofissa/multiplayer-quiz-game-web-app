export interface Question {
    _id: string;
    question: string;
    incorrectAnswers: string[];
    correctAnswers: string[];
    pointValue: number;
    lastModified: Date;
}
