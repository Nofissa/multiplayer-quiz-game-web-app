import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsBoolean, IsDate, IsNumber, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

enum ValidationValues {
    MinSizeArray = 1,
    MinPointValue = 10,
    MaxPointValue = 100,
    MinTimeInSeconds = 10,
    MaxTimeInSeconds = 60,
    MinLengthTitle = 10,
    MaxLengthTitle = 100,
    MinLengthDescription = 10,
    MaxLengthDescription = 500,
}

export class QuestionDto {
    @ApiProperty()
    @IsString()
    question: string;

    @ApiProperty()
    @IsArray()
    @ArrayMinSize(ValidationValues.MinSizeArray, { message: 'At least one incorrect answer is required' })
    incorrectAnswers: string[];

    @ApiProperty()
    @IsArray()
    @ArrayMinSize(ValidationValues.MinSizeArray, { message: 'At least one correct answer is required' })
    correctAnswers: string[];

    @ApiProperty()
    @IsDate()
    @Type(() => Date)
    @IsOptional()
    lastModified: Date;

    @ApiProperty()
    @IsNumber()
    @Max(ValidationValues.MaxPointValue, { message: 'Max value of pointValue is 100' })
    @Min(ValidationValues.MinPointValue, { message: 'Min value of pointValue is 10' })
    pointValue: number;

    @ApiProperty()
    @IsNumber()
    @Max(ValidationValues.MaxTimeInSeconds, { message: 'Max value of timeInSeconds is 60 sec' })
    @Min(ValidationValues.MinTimeInSeconds, { message: 'Min value of timeInSeconds is 10 sec' })
    timeInSeconds: number;
}

export class UpsertQuizDto {
    @ApiProperty()
    @IsString()
    @MaxLength(ValidationValues.MaxLengthTitle, { message: 'Title must be 100 characters long maximum' })
    //@MinLength(ValidationValues.MinLengthTitle, { message: 'Title must be 10 characters long minimum' })
    titre: string;

    @ApiProperty()
    @IsString()
    @MaxLength(ValidationValues.MaxLengthDescription, { message: 'Description must be 100 characters long maximum' })
    @MinLength(ValidationValues.MinLengthDescription, { message: 'Description must be 10 characters long minimum' })
    description: string;

    @ApiProperty()
    @IsBoolean()
    isHidden: boolean;

    @ApiProperty()
    @IsDate()
    @Type(() => Date)
    @IsOptional()
    lastModified: Date;

    @ApiProperty()
    @IsArray()
    questions: QuestionDto[];

    @ApiProperty()
    _id?: string;
}
