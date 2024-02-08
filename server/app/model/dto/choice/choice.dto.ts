import { IsBoolean, IsString } from 'class-validator';

export class ChoiceDto {
    @IsString({ message: "l'id devrait être une chaîne de caractères" })
    text: string;

    @IsBoolean({ message: 'la valeur de correction devrait être un booléen' })
    isCorrect?: boolean;
}
