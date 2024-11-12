// choice is only used within question so both classes are in this file
// eslint-disable-next-line max-classes-per-file
import { QuestionType } from '@common/question-type';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsDate, ValidateNested } from 'class-validator';
import { Document } from 'mongoose';

export class Choice {
    @ApiProperty()
    @Prop({ required: true })
    text: string;

    @ApiProperty()
    @Prop({ required: true })
    isCorrect: boolean;
}

export type QuestionDocument = Question & Document;

@Schema()
export class Question {
    @ApiProperty()
    _id?: string;

    @ApiProperty()
    @Prop({ required: true })
    type: QuestionType;

    @ApiProperty()
    @Prop({ required: true })
    text: string;

    @ApiProperty()
    @Prop({ required: false })
    @ValidateNested({ each: true })
    choices: Choice[];

    @ApiProperty()
    @Prop({ required: true })
    points: number;

    @ApiProperty()
    @Prop({ required: false })
    @IsDate()
    lastModification?: Date;
}

export const questionSchema = SchemaFactory.createForClass(Question);
SchemaFactory.createForClass(Question);
