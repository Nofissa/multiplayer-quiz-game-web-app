/* eslint-disable no-restricted-imports */
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDate, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { UpsertQuestionDto } from '../question/upsert-question.dto';

enum ValidationValues {
    MinLengthTitle = 10,
    MaxLengthTitle = 100,
    MinLengthDescription = 10,
    MaxLengthDescription = 500,
}

export class UpsertQuizDto {
    @ApiProperty()
    @IsString()
    @MaxLength(ValidationValues.MaxLengthTitle, { message: 'Title must be 100 characters long maximum' })
    @MinLength(ValidationValues.MinLengthTitle, { message: 'Title must be 10 characters long minimum' })
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
    questions: UpsertQuestionDto[];

    @ApiProperty()
    _id?: string;
}
