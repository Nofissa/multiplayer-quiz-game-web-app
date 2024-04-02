import { Submission } from '@common/submission';
export const submissionStub = (): Submission => {
    return {
        choices: [
            { payload: 0, isSelected: false },
            { payload: 1, isSelected: false },
            { payload: 2, isSelected: false },
            { payload: 3, isSelected: true },
        ],

        isFinal: true,
    };
};
