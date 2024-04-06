import { Submission } from '@common/submission';

export const submissionStub = (): Submission[] => {
    return [
        {
            choices: [
                { payload: 0, isSelected: false },
                { payload: 1, isSelected: false },
                { payload: 2, isSelected: false },
                { payload: 3, isSelected: false },
            ],
            isFinal: false,
        },

        {
            choices: [
                { payload: 0, isSelected: true },
                { payload: 1, isSelected: false },
                { payload: 2, isSelected: true },
                { payload: 3, isSelected: false },
            ],
            isFinal: false,
        },

        {
            choices: [
                { payload: 0, isSelected: false },
                { payload: 1, isSelected: false },
                { payload: 2, isSelected: false },
                { payload: 3, isSelected: true },
            ],
            isFinal: true,
        },

        {
            choices: [
                { payload: 0, isSelected: true },
                { payload: 1, isSelected: true },
                { payload: 2, isSelected: true },
                { payload: 3, isSelected: true },
            ],
            isFinal: false,
        },
    ];
};

export const submissionsStub = (): Submission[][] => {
    return [
        [submissionStub()[0], submissionStub()[1], submissionStub()[2], submissionStub()[3]],
        [submissionStub()[1], submissionStub()[1], submissionStub()[1], submissionStub()[1]],
    ];
};
