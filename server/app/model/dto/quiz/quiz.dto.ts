import { QuestionDto } from '@app/model/dto/question/question.dto';
import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { QuizQuestionDto } from '@app/model/dto/quiz/quiz-question.dto';

export class QuizDto {
    @IsString()
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
    lastModification?: Date;

    @IsString({ each: true })
    @ValidateNested({ each: true })
    @Type(() => QuestionDto)
    questions: QuizQuestionDto[];

    @IsBoolean()
    @IsOptional()
    isHidden?: boolean;
}
