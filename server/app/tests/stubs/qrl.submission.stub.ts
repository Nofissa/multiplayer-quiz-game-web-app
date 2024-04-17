import { QrlSubmission } from '@common/qrl-submission';

export const qrlSubmissionStub = (): QrlSubmission => {
    return {
        answer: 'hello',
        clientId: 'playerId',
    };
};
