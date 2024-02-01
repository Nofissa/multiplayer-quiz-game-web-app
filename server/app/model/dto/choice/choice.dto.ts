import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class ChoiceDto {
    @IsString()
    text: string;

    @IsNotEmpty()
    @IsBoolean()
    isCorrect?: boolean;
}
