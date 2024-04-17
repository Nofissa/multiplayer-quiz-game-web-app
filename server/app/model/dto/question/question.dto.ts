import { VALIDATION_VALUES } from '@app/constants/validation-values';
import { ChoiceDto } from '@app/model/dto/choice/choice.dto';
import { IsMultipleOf } from '@app/validators/is-multiple-of.validator';
import { IsQuestionType } from '@app/validators/is-question-type.validator';
import { IsValidChoices } from '@app/validators/is-valid-choices.validator';
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
    @Min(VALIDATION_VALUES.minPoints, { message: `le champ 'points' de question devrait être plus grand ou égal à ${VALIDATION_VALUES.minPoints}` })
    @Max(VALIDATION_VALUES.maxPoints, { message: `le champ 'points' de question devrait être plus petit ou égal à ${VALIDATION_VALUES.maxPoints}` })
    @IsMultipleOf(VALIDATION_VALUES.multipleOfPoints)
    points: number;

    @IsArray({ message: "le champ 'choices' de question devrait être un tableau" })
    @IsOptional()
    @ArrayMinSize(VALIDATION_VALUES.minAnswersSize, {
        message: `le champ 'choices' de question devrait être de taille plus grande ou égale à ${VALIDATION_VALUES.minAnswersSize}`,
    })
    @ArrayMaxSize(VALIDATION_VALUES.maxAnswersSize, {
        message: `le champ 'choices' de question devrait être de taille plus petite ou égale ${VALIDATION_VALUES.maxAnswersSize}`,
    })
    @Type(() => ChoiceDto)
    @IsValidChoices({
        message: "Le champ 'choices' de question devrait contenir au moins une entrée valide et une autre entrée invalide",
    })
    @ValidateNested({ each: true })
    choices?: ChoiceDto[];

    @IsDate({ message: "le champ 'lastModification' de question devrait être une date" })
    @IsOptional()
    @Type(() => Date)
    lastModification?: Date;
}
