import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type QuestionDocument = Question & Document;

@Schema()
export class Question {
    @ApiProperty()
    _id?: string;

    @ApiProperty()
    @Prop({ required: true })
    question: string;

    @ApiProperty()
    @Prop({ type: [{ _id: false, answer: String, isCorrect: Boolean }], required: true })
    answers: { answer: string; isCorrect: boolean }[];

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
