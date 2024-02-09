import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class ChoiceDto {
    @IsString()
    text: string;

    @IsOptional()
    @Transform(({ value }) => value === true)
    @IsBoolean()
    isCorrect: boolean = false;
}
