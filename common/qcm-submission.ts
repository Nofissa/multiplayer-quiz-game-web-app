export interface QcmSubmission {
    clientId: string;
    choices: {
        payload: number;
        isSelected: boolean;
    }[];
    isFinal?: boolean;
}
