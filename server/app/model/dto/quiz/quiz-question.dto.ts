import { ValidationValues } from '@app/enums/validation-values';
import { ChoiceDto } from '@app/model/dto/choice/choice.dto';
import { IsMultipleOf } from '@app/validators/is-multiple-of.validator';
import { IsQuestionType } from '@app/validators/is-question-type.validator';
import { QuestionType } from '@common/question-type';
import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';

export class QuizQuestionDto {
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

    @IsOptional()
    @IsArray()
    @ArrayMinSize(ValidationValues.MinAnswersSize, { message: `choices size must be greater or equal to ${ValidationValues.MinAnswersSize}` })
    @ArrayMaxSize(ValidationValues.MaxAnswersSize, { message: `choices size must be lesser or equal to ${ValidationValues.MaxAnswersSize}` })
    @Type(() => ChoiceDto)
    @ValidateNested({ each: true })
    choices?: ChoiceDto[];

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    lastModification?: Date;
}
