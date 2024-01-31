import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { QuizController } from './controllers/quiz/quiz.controller';
import { Quiz, quizSchema } from './model/database/quiz';
import { QuizService } from './services/quiz/quiz.service';

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
        MongooseModule.forFeature([{ name: Quiz.name, schema: quizSchema }]),
    ],

    controllers: [QuizController],
    providers: [QuizService, Logger],
})
export class AppModule {}
