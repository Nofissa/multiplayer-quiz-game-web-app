import { QrlSubmission } from '@common/qrl-submission';

export const qrlSubmissionStub = (): QrlSubmission => {
    return {
        answer: 'bonjour',
        clientId: 'playerId',
    };
};
