import { Submission } from '@common/submission';

export const submissionStub = (): Submission[] => {
    return [
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
};

export const submissionMapStub = (): Map<string, Submission>[] => {
    return [
        new Map([
            ['ClientID1', submissionStub()[0]],
            ['ClientID2', submissionStub()[1]],
            ['ClientID3', submissionStub()[2]],
            ['ClientID4', submissionStub()[3]],
        ]),
        new Map([
            ['ClientID5', submissionStub()[1]],
            ['ClientID6', submissionStub()[1]],
            ['ClientID7', submissionStub()[1]],
            ['ClientID8', submissionStub()[1]],
        ]),
    ];
};
