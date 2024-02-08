import { ValidationValues } from '@app/enums/validation-values';
import { ChoiceDto } from '@app/model/dto/choice/choice.dto';
import { IsMultipleOf } from '@app/validators/is-multiple-of.validator';
import { IsQuestionType } from '@app/validators/is-question-type.validator';
import { QuestionType } from '@common/question-type';
import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';

export class QuizQuestionDto {
    @IsString({ message: 'le type devrait être une chaîne de caractères' })
    @IsQuestionType({ message: 'le type devrait être une valeur valide' })
    @IsNotEmpty({ message: 'le type ne devrait pas être vide' })
    type: QuestionType;

    @IsString({ message: 'le texte devrait être une chaîne de caractères' })
    @IsNotEmpty({ message: 'le texte ne devrait pas être vide' })
    text: string;

    @IsNumber({}, { message: 'les points devraient être un nombre' })
    @Min(ValidationValues.MinPoints, { message: `les points devraient être plus grand ou égal ${ValidationValues.MinPoints}` })
    @Max(ValidationValues.MaxPoints, { message: `les points devraient être plus petit ou égal ${ValidationValues.MaxPoints}` })
    @IsMultipleOf(ValidationValues.MultipleOfPoints)
    points: number;

    @IsArray({ message: 'les choix devraient être un tableau' })
    @ArrayMinSize(ValidationValues.MinAnswersSize, {
        message: `la taille des choix devraient être plus grand ou égal ${ValidationValues.MinAnswersSize}`,
    })
    @ArrayMaxSize(ValidationValues.MaxAnswersSize, {
        message: `la taille des choix devraient être plus petit ou égal ${ValidationValues.MaxAnswersSize}`,
    })
    @ValidateNested({ each: true })
    choices: ChoiceDto[];

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    lastModification?: Date;
}
