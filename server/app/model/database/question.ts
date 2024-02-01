// eslint-disable-next-line max-classes-per-file
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type QuestionDocument = Question & Document;

export class Answer {
    @ApiProperty()
    _id?: string;

    @ApiProperty()
    @Prop({ required: true })
    answer: string;

    @ApiProperty()
    @Prop({ required: true })
    isCorrect: boolean;
}

@Schema()
export class Question {
    @ApiProperty()
    _id?: string;

    @ApiProperty()
    @Prop({ required: true })
    question: string;

    @ApiProperty()
    answers: Answer[];

    @ApiProperty()
    @Prop({ required: true })
    pointValue: number;

    @ApiProperty()
    @Prop({ required: true })
    timeInSeconds: number;

    @ApiProperty()
    @Prop({ required: false })
    lastModified: Date;
}

export const questionSchema = SchemaFactory.createForClass(Question);
