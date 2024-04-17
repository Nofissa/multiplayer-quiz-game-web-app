import { Quiz } from '@common/quiz';
import { qcmQuestionStub, allQuestionTypeStub } from './question.stubs';

export const quizStub = () => {
    return {
        _id: 'testId',
        title: 'Quiz 1',
        description: 'Quiz 1 description',
        duration: 40,
        lastModification: new Date('2024-01-20 18:43:27'),
        questions: qcmQuestionStub(),
        isHidden: true,
        id: '4d5e6f',
    };
};

export const allQuestionTypeQuiz = (): Quiz => {
    return {
        _id: 'testId',
        title: 'Quiz 2',
        description: 'Quiz 2 description',
        duration: 40,
        lastModification: new Date('2024-01-20 18:43:27'),
        questions: allQuestionTypeStub(),
        isHidden: true,
        id: '4d5e6f',
    };
};
