import { quizStub } from '@app/tests/stubs/quiz.stubs';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const QuizServive = jest.fn().mockResolvedValue({
    addQuiz: jest.fn().mockResolvedValue(quizStub()),
    updateQuiz: jest.fn().mockResolvedValue(quizStub()),
    deleteQuiz: jest.fn().mockResolvedValue(quizStub()),
    modifyQuiz: jest.fn().mockResolvedValue(quizStub()),
    hideQuizById: jest.fn().mockResolvedValue(quizStub()),
});
