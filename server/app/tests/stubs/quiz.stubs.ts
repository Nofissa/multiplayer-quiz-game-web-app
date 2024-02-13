import { Quiz } from '@app/model/database/quiz';
import { questionStub } from '@app/tests/stubs/question.stubs';

export const quizStub = (): Quiz => {
    return {
        _id: '123456789',
        title: 'Quiz 1',
        id: '4d5e6f',
        description: 'Quiz 1 description',
        questions: questionStub(),
        duration: 40,
        lastModification: new Date('2024-01-20 18:43:27'),
        isHidden: true,
    };
};
