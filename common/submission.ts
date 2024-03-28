export interface Submission {
    choices: { 
        payload: number|string;
        isSelected?: boolean;
    }[];
    isFinal?: boolean;
}
