export interface QcmSubmission {
    choices: {
        payload: number;
        isSelected: boolean;
    }[];
    isFinal?: boolean;
}
