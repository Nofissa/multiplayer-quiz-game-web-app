import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDate, IsOptional, IsString } from 'class-validator';
export class QuestionDto {
    @ApiProperty()
    @IsString()
    question: string; 

    @ApiProperty()
    @IsArray()
    incorrectAnswers: string[];

    @ApiProperty()
    @IsString()
    correctAnswer: string;
    
    @ApiProperty()
    @IsDate()
    @Type(() => Date)
    @IsOptional()
    lastModified: Date;
    
}

export class UpsertQuizDto {
 
    @ApiProperty()
    @IsString()
    titre: string;

    @ApiProperty()
    @IsString()
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
