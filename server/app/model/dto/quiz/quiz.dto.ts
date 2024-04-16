import { QuestionDto } from '@app/model/dto/question/question.dto';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import 'reflect-metadata';

export class QuizDto {
    @IsString({ message: "le champ '_id' de quiz devrait être une chaîne de caractères" })
    @IsOptional()
    _id?: string;

    @IsString({ message: "le champ 'id' de quiz devrait être une chaîne de caractères" })
    @IsOptional()
    id?: string;

    @IsString({ message: "le champ 'title' de quiz devrait être une chaîne de caractères" })
    @IsNotEmpty({ message: "le champ 'title' de quiz ne devrait pas être vide" })
    title: string;

    @IsString({ message: "le champ 'description' de quiz devrait être une chaîne de caractères" })
    @IsNotEmpty({ message: "le champ 'description' de quiz ne devrait pas être vide" })
    description: string;

    @IsNumber({}, { message: "le champ 'durée' de quiz devrait être un nombre" })
    duration: number;

    @IsDate({ message: "le champ 'lastModification' de quiz devrait être une date" })
    @IsOptional()
    @Type(() => Date)
    lastModification?: Date;

    @IsArray({ message: "le champ 'questions' de quiz devrait être un tableau" })
    @Type(() => QuestionDto)
    @ValidateNested({ each: true })
    questions: QuestionDto[];

    @IsBoolean({ message: "le champ 'isHidden' de quiz devrait être un booléen" })
    @IsOptional()
    isHidden?: boolean;
}
