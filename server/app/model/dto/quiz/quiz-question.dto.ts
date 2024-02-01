import { ArrayMaxSize, ArrayMinSize, IsArray, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';
import { QuestionType } from '@common/question-type';
import { ApiProperty } from '@nestjs/swagger';
import { IsMultipleOf } from '@app/validators/is-multiple-of.validator';
import { ChoiceDto } from '@app/model/dto/choice/choice.dto';
import { ValidationValues } from '@app/enums/validation-values';

export class QuizQuestionDto {
    @IsString()
    _id?: string;

    @IsString()
    @IsNotEmpty()
    type: QuestionType;

    @IsString()
    @IsNotEmpty()
    text: string;

    @ApiProperty()
    @IsNumber()
    @Min(ValidationValues.MinPointValue, { message: `points must be greater or equal to ${ValidationValues.MinPointValue}` })
    @Max(ValidationValues.MaxPointValue, { message: `points must be lesser or equal to ${ValidationValues.MaxPointValue}` })
    @IsMultipleOf(ValidationValues.MultipleOfPointValue)
    points: number;

    @IsString({ each: true })
    @ApiProperty()
    @IsArray()
    @ArrayMinSize(ValidationValues.MinSizeAnswerArray, { message: `choices size must be greater or equal to ${ValidationValues.MinSizeAnswerArray}` })
    @ArrayMaxSize(ValidationValues.MaxSizeAnswerArray, { message: `choices size must be lesser or equal to ${ValidationValues.MaxSizeAnswerArray}` })
    @ValidateNested({ each: true })
    choices: ChoiceDto[];

    @ApiProperty()
    @IsOptional()
    @IsDate()
    lastModification?: Date;
}
