import { Submission } from '@common/submission';

const submissions = [
    {
        choices: [
            { index: 0, isSelected: false },
            { index: 1, isSelected: false },
            { index: 2, isSelected: false },
            { index: 3, isSelected: false },
        ],
        isFinal: false,
    },

    {
        choices: [
            { index: 0, isSelected: true },
            { index: 1, isSelected: false },
            { index: 2, isSelected: true },
            { index: 3, isSelected: false },
        ],
        isFinal: false,
    },

    {
        choices: [
            { index: 0, isSelected: false },
            { index: 1, isSelected: false },
            { index: 2, isSelected: false },
            { index: 3, isSelected: true },
        ],
        isFinal: true,
    },

    {
        choices: [
            { index: 0, isSelected: true },
            { index: 1, isSelected: true },
            { index: 2, isSelected: true },
            { index: 3, isSelected: true },
        ],
        isFinal: false,
    },
];

export const submissionStub = (): Submission[] => {
    return submissions;
};
