import { QcmSubmission } from '@common/qcm-submission';

export const submissionStub = (): QcmSubmission[] => {
    return [
        {
            clientId: 'Client 1',
            choices: [
                { payload: 0, isSelected: false },
                { payload: 1, isSelected: false },
                { payload: 2, isSelected: false },
                { payload: 3, isSelected: false },
            ],
            isFinal: false,
        },

        {
            clientId: 'Client 2',
            choices: [
                { payload: 0, isSelected: true },
                { payload: 1, isSelected: false },
                { payload: 2, isSelected: true },
                { payload: 3, isSelected: false },
            ],
            isFinal: false,
        },

        {
            clientId: 'Client 3',
            choices: [
                { payload: 0, isSelected: false },
                { payload: 1, isSelected: false },
                { payload: 2, isSelected: false },
                { payload: 3, isSelected: true },
            ],
            isFinal: true,
        },

        {
            clientId: 'Client 4',
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

export const submissionsStub = (): QcmSubmission[][] => {
    return [
        [submissionStub()[0], submissionStub()[1], submissionStub()[2], submissionStub()[3]],
        [submissionStub()[1], submissionStub()[1], submissionStub()[1], submissionStub()[1]],
    ];
};
