// eslint-disable-next-line max-classes-per-file
import { QuestionType } from '@common/question-type';
import { IsMultipleOf } from '@app/validators/is-multiple-of.validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';
import { ChoiceDto } from '@app/model/dto/choice/choice.dto';
import { ValidationValues } from '@app/enums/validation-values';

export class QuestionDto {
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
    @Type(() => ChoiceDto)
    choices: ChoiceDto[];

    @ApiProperty()
    @IsOptional()
    @IsDate()
    lastModification?: Date;
}
