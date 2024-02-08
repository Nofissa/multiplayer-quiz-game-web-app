import { IsBoolean, IsString } from 'class-validator';

export class ChoiceDto {
    @IsString()
    text: string;

    @IsBoolean()
    isCorrect: boolean;
}
