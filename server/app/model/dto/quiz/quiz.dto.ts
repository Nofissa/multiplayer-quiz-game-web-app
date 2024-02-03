import { QuizQuestionDto } from '@app/model/dto/quiz/quiz-question.dto';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

export class QuizDto {
    @IsString()
    @IsOptional()
    _id?: string;

    @IsString()
    @IsOptional()
    id?: string;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsNumber()
    duration: number;

    @IsDate()
    @IsOptional()
    @Type(() => Date)
    lastModification?: Date;

    @IsArray()
    @ValidateNested({ each: true })
    questions: QuizQuestionDto[];

    @IsBoolean()
    @IsOptional()
    isHidden?: boolean;
}
