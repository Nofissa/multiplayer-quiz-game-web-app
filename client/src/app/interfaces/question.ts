export interface Question {
    question: string;
    incorrectAnswers: string[];
    correctAnswer: string;
    lastModified: Date;
    _id: string;
}
