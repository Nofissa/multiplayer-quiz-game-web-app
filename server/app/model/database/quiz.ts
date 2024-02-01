import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';
import { Question } from './question';

export type QuizDocument = Quiz & Document;

@Schema()
export class Quiz {
    @ApiProperty()
    @Prop({ required: true })
    title: string;

    @ApiProperty()
    @Prop({ required: true })
    description: string;

    @ApiProperty()
    @Prop({ required: true })
    lastModified: Date;

    @ApiProperty()
    @Prop({ required: true })
    isHidden: boolean;

    @ApiProperty()
    @Prop({ required: true })
    questions: Question[];

    @ApiProperty()
    _id?: string;
}

export const quizSchema = SchemaFactory.createForClass(Quiz);
