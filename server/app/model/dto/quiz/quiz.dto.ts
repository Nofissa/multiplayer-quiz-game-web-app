import { QuizQuestionDto } from '@app/model/dto/quiz/quiz-question.dto';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

export class QuizDto {
    @IsString({ message: "l'id devrait être une chaîne de caractères" })
    @IsOptional()
    _id?: string;

    @IsString({ message: 'le titre devrait être une chaîne de caractères' })
    @IsOptional()
    id?: string;

    @IsString({ message: 'le titre devrait être une chaîne de caractères' })
    @IsNotEmpty({ message: 'le titre ne devrait pas être vide' })
    title: string;

    @IsString({ message: 'la description devrait être une chaîne de caractères' })
    @IsNotEmpty({ message: 'la description ne devrait pas être vide' })
    description: string;

    @IsNumber({}, { message: 'la durée devrait être un nombre' })
    duration: number;

    @IsDate()
    @IsOptional()
    @Type(() => Date)
    lastModification?: Date;

    @IsArray({ message: 'la date de dernière modification devrait être une date' })
    @ValidateNested({ each: true })
    questions: QuizQuestionDto[];

    @IsBoolean()
    @IsOptional()
    isHidden?: boolean;
}
