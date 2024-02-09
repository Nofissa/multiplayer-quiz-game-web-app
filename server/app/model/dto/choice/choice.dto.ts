import { IsBoolean, IsString } from 'class-validator';

export class ChoiceDto {
    @IsString({ message: "le champ 'text' de choice devrait être une chaîne de caractères" })
    text: string;

    @IsBoolean({ message: "le champ 'isCorrect' de choice devrait être un booléen" })
    isCorrect?: boolean;
}
