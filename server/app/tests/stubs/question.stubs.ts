import { Question } from '@app/model/database/question';
import { firstChoiceStub, secondChoiceStub } from './choices.stubs';
import { QuestionType } from '@common/question-type';

export const questionStub = (): Question[] => {
    return [
        {
            _id: '123456789',
            text: 'Quelle est la valeur de la constante R dans la formule pV = nRT',
            type: QuestionType.QCM,
            choices: firstChoiceStub(),
            points: 100,
            lastModification: new Date('2024-01-20 18:43:27'),
        },
        {
            _id: '987654321',
            text: "En quelle année la compagnie d'automobile Volkswagen a-t-elle été fondée?",
            type: QuestionType.QCM,
            choices: secondChoiceStub(),
            points: 30,
            lastModification: new Date('2024-01-20 18:43:27'),
        },
    ];
};
