import { Question } from '@common/question';
import { firstChoiceStub, secondChoiceStub } from './choices.stubs';

export const qcmQuestionStub = (): Question[] => {
    return [
        {
            _id: '123456789',
            text: 'Quelle est la valeur de la constante R dans la formule pV = nRT',
            type: 'QCM',
            choices: firstChoiceStub(),
            points: 100,
            lastModification: new Date('2024-01-20 18:43:27'),
        },
        {
            _id: '987654321',
            text: "En quelle année la compagnie d'automobile Volkswagen a-t-elle été fondée?",
            type: 'QCM',
            choices: secondChoiceStub(),
            points: 30,
            lastModification: new Date('2024-01-20 18:43:27'),
        },
    ];
};

export const qrlQuestionStub = (): Question[] => {
    return [
        {
            _id: '123456789',
            text: 'Quelle est la valeur de la constante R dans la formule pV = nRT',
            type: 'QRL',
            choices: undefined,
            points: 100,
            lastModification: new Date('2024-01-20 18:43:27'),
        },
        {
            _id: '987654321',
            text: "En quelle année la compagnie d'automobile Volkswagen a-t-elle été fondée?",
            type: 'QRL',
            choices: undefined,
            points: 30,
            lastModification: new Date('2024-01-20 18:43:27'),
        },
    ];
};

export const bothQuestionStub = (): Question[] => {
    return [
        {
            _id: '123456789',
            text: 'Quelle est la valeur de la constante R dans la formule pV = nRT',
            type: 'QRL',
            choices: undefined,
            points: 100,
            lastModification: new Date('2024-01-20 18:43:27'),
        },
        {
            _id: '987654321',
            text: "En quelle année la compagnie d'automobile Volkswagen a-t-elle été fondée?",
            type: 'QRL',
            choices: undefined,
            points: 30,
            lastModification: new Date('2024-01-20 18:43:27'),
        },
        {
            _id: '123456789',
            text: 'Quelle est la valeur de la constante R dans la formule pV = nRT',
            type: 'QCM',
            choices: firstChoiceStub(),
            points: 100,
            lastModification: new Date('2024-01-20 18:43:27'),
        },
        {
            _id: '987654321',
            text: "En quelle année la compagnie d'automobile Volkswagen a-t-elle été fondée?",
            type: 'QCM',
            choices: secondChoiceStub(),
            points: 30,
            lastModification: new Date('2024-01-20 18:43:27'),
        },
    ];
};
