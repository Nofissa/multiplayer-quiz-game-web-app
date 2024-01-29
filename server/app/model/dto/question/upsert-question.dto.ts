import { IsMultipleOfTen } from '@app/validators/is-multiple-of-ten';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayNotEmpty, IsArray, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

enum ValidationValues {
    MinPointValue = 10,
    MaxPointValue = 100,
    MaxSizeAnswerArray = 3,
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
    @ArrayNotEmpty({ message: 'incorrectAnswers must not be empty' })
    @ArrayMaxSize(ValidationValues.MaxSizeAnswerArray, {
        message: `incorrectAnswers size must be lesser or equal to ${ValidationValues.MaxSizeAnswerArray}`,
    })
    incorrectAnswers: string[];

    @ApiProperty()
    @IsArray()
    @ArrayNotEmpty({ message: 'correctAnswers must not be empty' })
    @ArrayMaxSize(ValidationValues.MaxSizeAnswerArray, {
        message: `correctAnswers size must be lesser or equal to ${ValidationValues.MaxSizeAnswerArray}`,
    })
    correctAnswers: string[];

    @ApiProperty()
    @IsNumber()
    @Min(ValidationValues.MinPointValue, { message: `pointValue must be greater or equal to ${ValidationValues.MinPointValue}` })
    @Max(ValidationValues.MaxPointValue, { message: `pointValue must be lesser or equal to ${ValidationValues.MaxPointValue}` })
    @IsMultipleOfTen()
    pointValue: number;

    @ApiProperty()
    @IsDate()
    @Type(() => Date)
    @IsOptional()
    lastModified: Date;
}
