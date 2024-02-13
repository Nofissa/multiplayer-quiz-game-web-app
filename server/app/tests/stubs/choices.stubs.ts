import { Choice } from '@app/model/database/question';

export const firstChoiceStub = (): Choice[] => {
    return [
        { text: '3.14 V/m^2', isCorrect: false },
        { text: '2.72 C/s', isCorrect: false },
        { text: '6.022x10^23 mol/N', isCorrect: false },
        { text: '8.31 J/mol/K', isCorrect: true },
    ];
};

export const secondChoiceStub = (): Choice[] => {
    return [
        { text: '1928', isCorrect: false },
        { text: '1987', isCorrect: false },
        { text: '1947', isCorrect: false },
        { text: '1937', isCorrect: true },
    ];
};
