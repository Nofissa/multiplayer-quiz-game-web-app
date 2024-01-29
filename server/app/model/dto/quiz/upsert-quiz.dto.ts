import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsBoolean, IsDate, IsNumber, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
export class QuestionDto {
    @ApiProperty()
    @IsString()
    question: string; 

    @ApiProperty()
    @IsArray()
    @ArrayMinSize(1, { message: 'At least one incorrect answer is required' })
    incorrectAnswers: string[];

    @ApiProperty()
    @IsArray()
    @ArrayMinSize(1, { message: 'At least one correct answer is required' })
    correctAnswers: string[];
    
    @ApiProperty()
    @IsDate()
    @Type(() => Date)
    @IsOptional()
    lastModified: Date;
    
    @ApiProperty()
    @IsNumber()
    @Max(100, { message: 'Max value of pointValue is 100' })
    @Min(10, { message: 'Min value of pointValue is 10' })
    pointValue: number; 

    @ApiProperty()
    @IsNumber()
    @Max(60, { message: 'Max value of timeInSeconds is 60 sec' })
    @Min(10, { message: 'Min value of timeInSeconds is 10 sec' })
    timeInSeconds: number;
}

export class UpsertQuizDto {
    @ApiProperty()
    @IsString()
    @MaxLength(100, { message: 'Title must be 100 characters long maximum' })
    @MinLength(10, { message: 'Title must be 10 characters long minimum' })
    titre: string;

    @ApiProperty()
    @IsString()
    @MaxLength(500, { message: 'Description must be 100 characters long maximum' })
    @MinLength(10, { message: 'Description must be 10 characters long minimum' })
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
