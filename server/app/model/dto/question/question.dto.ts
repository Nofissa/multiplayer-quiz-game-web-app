import { ValidationValues } from '@app/enums/validation-values';
import { ChoiceDto } from '@app/model/dto/choice/choice.dto';
import { IsMultipleOf } from '@app/validators/is-multiple-of.validator';
import { IsQuestionType } from '@app/validators/is-question-type.validator';
import { QuestionType } from '@common/question-type';
import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';
import 'reflect-metadata';

export class QuestionDto {
    @IsString()
    @IsOptional()
    _id?: string;

    @IsString({ message: "le champ 'type' de question devrait être une chaîne de caractères" })
    @IsNotEmpty({ message: "le champ 'type' de question ne devrait pas être vide" })
    @IsQuestionType({ message: "le champ 'type' de question devrait avoir la valeur 'QCM' ou 'QRL'" })
    type: QuestionType;

    @IsString({ message: "le champ 'text' de question devrait être une chaîne de caractères" })
    @IsNotEmpty({ message: "le champ 'text' de question ne devrait pas être vide" })
    text: string;

    @IsNumber({}, { message: "le champ 'points' de question devrait être un nombre" })
    @Min(ValidationValues.MinPoints, { message: `le champ 'points' de question devrait être plus grand ou égal à ${ValidationValues.MinPoints}` })
    @Max(ValidationValues.MaxPoints, { message: `le champ 'points' de question devrait être plus petit ou égal à ${ValidationValues.MaxPoints}` })
    @IsMultipleOf(ValidationValues.MultipleOfPoints)
    points: number;

    @IsArray({ message: "le champ 'choices' de question devrait être un tableau" })
    @ArrayMinSize(ValidationValues.MinAnswersSize, {
        message: `le champ 'choices' de question devrait être de taille plus grande ou égale à ${ValidationValues.MinAnswersSize}`,
    })
    @ArrayMaxSize(ValidationValues.MaxAnswersSize, {
        message: `le champ 'choices' de question devrait être de taille plus petite ou égale ${ValidationValues.MaxAnswersSize}`,
    })
    @Type(() => ChoiceDto)
    @ValidateNested({ each: true })
    choices: ChoiceDto[];

    @IsDate({ message: "le champ 'lastModification' de question devrait être une date" })
    @IsOptional()
    @Type(() => Date)
    lastModification?: Date;
}
