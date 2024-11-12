import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type GameSummaryDocument = GameSummary & Document;

@Schema()
export class GameSummary {
    @ApiProperty()
    _id?: string;

    @ApiProperty()
    @Prop({ required: true })
    title: string;

    @ApiProperty()
    @Prop({ required: true })
    startDate: Date;

    @ApiProperty()
    @Prop({ required: true })
    numberOfPlayers: number;

    @ApiProperty()
    @Prop({ required: true })
    bestScore: number;
}

export const gameSummarySchema = SchemaFactory.createForClass(GameSummary);
