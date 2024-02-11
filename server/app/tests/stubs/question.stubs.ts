import { Question } from '@app/model/database/question';
import { firstChoiceStub, secondChoiceStub } from './choices.stubs';

export const questionStub = (): Question[] => {
    return [
        {
            text: 'Quelle est la valeur de la constante R dans la formule pV = nRT',
            type: 'QCM',
            choices: firstChoiceStub(),
            points: 100,
            lastModification: new Date('2024-01-20 18:43:27'),
        },
        {
            text: "En quelle année la compagnie d'automobile Volkswagen a-t-elle été fondée?",
            type: 'QCM',
            choices: secondChoiceStub(),
            points: 30,
            lastModification: new Date('2024-01-20 18:43:27'),
        },
    ];
};
