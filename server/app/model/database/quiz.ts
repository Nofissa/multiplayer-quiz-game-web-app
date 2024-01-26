import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type QuizDocument = Quiz & Document;
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
    @Prop({ required: true })
    pointValue: number; 

    @ApiProperty()
    @Prop({ required: true })
    timeInSeconds: number;
}

@Schema()
export class Quiz {
    @ApiProperty()
    @Prop({ required: true })
    titre: string;

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

export const questionSchema = SchemaFactory.createForClass(Quiz);
