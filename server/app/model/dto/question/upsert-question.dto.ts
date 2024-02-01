// eslint-disable-next-line max-classes-per-file
import { IsMultipleOf } from '@app/validators/is-multiple-of.validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsBoolean, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

enum ValidationValues {
    MinPointValue = 10,
    MaxPointValue = 100,
    MinTimeInSeconds = 10,
    MaxTimeInSeconds = 60,
    MinSizeAnswerArray = 2,
    MaxSizeAnswerArray = 4,
    MultipleOfPointValue = 10,
}

export class AnswerDto {
    @ApiProperty()
    _id?: string;

    @ApiProperty()
    @IsString()
    answer: string;

    @ApiProperty()
    @IsBoolean()
    isCorrect: boolean;
}

export class UpsertQuestionDto {
    @ApiProperty()
    _id?: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty({ message: 'question must not be empty' })
    question: string;

    @ApiProperty()
    @IsArray()
    @ArrayMinSize(ValidationValues.MinSizeAnswerArray, { message: `answers size must be greater or equal to ${ValidationValues.MinSizeAnswerArray}` })
    @ArrayMaxSize(ValidationValues.MinSizeAnswerArray, { message: `answers size must be lesser or equal to ${ValidationValues.MinSizeAnswerArray}` })
    answers: AnswerDto[];

    @ApiProperty()
    @IsNumber()
    @Min(ValidationValues.MinPointValue, { message: `pointValue must be greater or equal to ${ValidationValues.MinPointValue}` })
    @Max(ValidationValues.MaxPointValue, { message: `pointValue must be lesser or equal to ${ValidationValues.MaxPointValue}` })
    @IsMultipleOf(ValidationValues.MultipleOfPointValue)
    pointValue: number;

    @ApiProperty()
    @IsNumber()
    @Min(ValidationValues.MinTimeInSeconds, { message: `timeInSeconds must be greater or equal to ${ValidationValues.MinTimeInSeconds}` })
    @Max(ValidationValues.MaxTimeInSeconds, { message: `timeInSeconds must be lesser or equal to ${ValidationValues.MaxTimeInSeconds}` })
    timeInSeconds: number;

    @ApiProperty()
    @IsDate()
    @Type(() => Date)
    @IsOptional()
    lastModified: Date;
}
