import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type QuestionDocument = Question & Document;

@Schema()
export class Question {
    @ApiProperty()
    @Prop({ required: true })
    question: string;

    @ApiProperty()
    @Prop({ required: true })
    incorrectAnswers: string[];

    @ApiProperty()
    @Prop({ required: true })
    correctAnswer: string;

    @ApiProperty()
    @Prop({ required: true })
    lastModified: Date;

    @ApiProperty()
    _id?: string;
}

export const questionSchema = SchemaFactory.createForClass(Question);
