import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDate, IsString } from 'class-validator';

export class UpdateQuestionDto {
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
    lastModified: Date;

    @ApiProperty()
    _id?: string;
}
