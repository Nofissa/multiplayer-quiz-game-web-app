import { Question } from '@app/model/database/question';
import { Quiz } from '@app/model/database/quiz';

const questionStub: Question[] = [
    {
        text: 'Quelle est la valeur de la constante R dans la formule pV = nRT',
        type: 'QCM',
        choices: [
            { text: '3.14 V/m^2', isCorrect: false },
            { text: '2.72 C/s', isCorrect: false },
            { text: '6.022x10^23 mol/N', isCorrect: false },
            { text: '8.31 J/mol/K', isCorrect: true },
        ],
        points: 100,
        lastModification: new Date('2024-01-20 18:43:27'),
    },
    {
        text: "En quelle année la compagnie d'automobile Volkswagen a-t-elle été fondée?",
        type: 'QCM',
        choices: [
            { text: '1928', isCorrect: false },
            { text: '1987', isCorrect: false },
            { text: '1947', isCorrect: false },
            { text: '1937', isCorrect: true },
        ],
        points: 30,
        lastModification: new Date('2024-01-20 18:43:27'),
    },
];

export const quizStub = (): Quiz => {
    return {
        title: 'Quiz 1',
        id: '4d5e6f',
        description: 'Quiz 1 description',
        questions: questionStub,
        duration: 40,
        lastModification: new Date('2024-01-20 18:43:27'),
        isHidden: true,
    };
};
