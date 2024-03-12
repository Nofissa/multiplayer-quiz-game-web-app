import { Submission } from '@common/submission';
export const submissionStub = (): Submission => {
    return {
        choices: [
            { index: 0, isSelected: true },
            { index: 1, isSelected: false },
            { index: 2, isSelected: true },
            { index: 0, isSelected: true },
        ],

        isFinal: true,
    };
};
