import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QuestionController } from './controllers/question/question.controller';
import { QuestionService } from './services/question/question.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Question, questionSchema } from './model/database/question';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (config: ConfigService) => ({
                uri: config.get<string>('DATABASE_CONNECTION_STRING'), // Loaded from .env
            }),
        }),
        MongooseModule.forFeature([{ name: Question.name, schema: questionSchema }]),
    ],
    controllers: [QuestionController],
    providers: [QuestionService, Logger],
})
export class AppModule {}
