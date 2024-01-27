import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

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
    incorrectAnswers: string[];

    @ApiProperty()
    @IsString()
    @IsNotEmpty({ message: 'correctAnswer must not be empty' })
    correctAnswer: string;

    @ApiProperty()
    @IsNumber()
    @Min(0, { message: 'pointValue must be greater or equal to zero' })
    pointValue: number;

    @ApiProperty()
    @IsNumber()
    @Min(1, { message: 'timeInSeconds must be greater than zero' })
    timeInSeconds: number;

    @ApiProperty()
    @IsDate()
    @Type(() => Date)
    @IsOptional()
    lastModified: Date;
}
