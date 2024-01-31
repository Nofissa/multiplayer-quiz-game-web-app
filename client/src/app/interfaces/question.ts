export interface Question {
    _id: string;
    question: string;
    incorrectAnswers: string[];
    correctAnswers: string[];
    pointValue: number;
    timeInSeconds: number;
    lastModified: Date;
}