import { QcmSubmission } from '@common/qcm-submission';
export const submissionStub = (): QcmSubmission => {
    return {
        clientId: 'playerId',
        choices: [
            { payload: 0, isSelected: false },
            { payload: 1, isSelected: false },
            { payload: 2, isSelected: false },
            { payload: 3, isSelected: true },
        ],

        isFinal: true,
    };
};
