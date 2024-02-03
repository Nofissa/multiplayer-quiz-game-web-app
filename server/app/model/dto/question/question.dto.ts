import { QuestionType } from '@common/question-type';
import { IsMultipleOf } from '@app/validators/is-multiple-of.validator';
import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';
import { ChoiceDto } from '@app/model/dto/choice/choice.dto';
import { ValidationValues } from '@app/enums/validation-values';
import { IsQuestionType } from '@app/validators/is-question-type.validator';

export class QuestionDto {
    @IsString()
    @IsOptional()
    _id?: string;

    @IsString()
    @IsQuestionType()
    @IsNotEmpty()
    type: QuestionType;

    @IsString()
    @IsNotEmpty()
    text: string;

    @IsNumber()
    @Min(ValidationValues.MinPoints, { message: `points must be greater or equal to ${ValidationValues.MinPoints}` })
    @Max(ValidationValues.MaxPoints, { message: `points must be lesser or equal to ${ValidationValues.MaxPoints}` })
    @IsMultipleOf(ValidationValues.MultipleOfPoints)
    points: number;

    @IsArray()
    @ArrayMinSize(ValidationValues.MinAnswersSize, { message: `choices size must be greater or equal to ${ValidationValues.MinAnswersSize}` })
    @ArrayMaxSize(ValidationValues.MaxAnswersSize, { message: `choices size must be lesser or equal to ${ValidationValues.MaxAnswersSize}` })
    @ValidateNested({ each: true })
    choices: ChoiceDto[];

    @IsDate()
    @IsOptional()
    @Type(() => Date)
    lastModification?: Date;
}
