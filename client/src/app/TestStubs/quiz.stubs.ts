import { questionStub } from './question.stubs';

export const quizStub = () => {
    return {
        _id: 'testId',
        title: 'Quiz 1',
        description: 'Quiz 1 description',
        duration: 40,
        lastModification: new Date('2024-01-20 18:43:27'),
        questions: questionStub(),
        isHidden: true,
        id: '4d5e6f',
    };
};
