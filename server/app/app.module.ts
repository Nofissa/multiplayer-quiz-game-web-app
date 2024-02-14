import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { QuestionController } from './controllers/question/question.controller';
import { QuizController } from './controllers/quiz/quiz.controller';
import { Question, questionSchema } from './model/database/question';
import { Quiz, quizSchema } from './model/database/quiz';
import { QuestionService } from './services/question/question.service';
import { QuizService } from './services/quiz/quiz.service';
import { AuthController } from './controllers/auth/auth.controller';
import { AuthService } from './services/auth/auth.service';
import { GameController } from './controllers/game/game.controller';
import { GameService } from './services/game/game.service';

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
        MongooseModule.forFeature([
            { name: Question.name, schema: questionSchema },
            { name: Quiz.name, schema: quizSchema },
        ]),
    ],
    controllers: [AuthController, GameController, QuestionController, QuizController],
    providers: [AuthService, GameService, QuestionService, QuizService, Logger],
})
export class AppModule {}
