import { Question } from "@app/interfaces/question";

export interface UpsertQuestionDialogData {
    title: string,
    question: Question;
}
