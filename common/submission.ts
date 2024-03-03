export interface Submission {
    choices: { 
        index: number;
        isSelected: boolean;
    }[];
    isFinal: boolean;
}
