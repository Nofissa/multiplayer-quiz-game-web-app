import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './controllers/auth/auth.controller';
import { GameHistoryController } from './controllers/game/game-history.controller';
import { GameController } from './controllers/game/game.controller';
import { QuestionController } from './controllers/question/question.controller';
import { QuizController } from './controllers/quiz/quiz.controller';
import { GameGateway } from './gateways/game.gateway';
import { MessageGateway } from './gateways/message.gateway';
import { PlayerGateway } from './gateways/player.gateway';
import { TimerGateway } from './gateways/timer.gateway';
import { GameHistory, gameHistorySchema } from './model/database/game-history';
import { Question, questionSchema } from './model/database/question';
import { Quiz, quizSchema } from './model/database/quiz';
import { AuthService } from './services/auth/auth.service';
import { GameHistoryService } from './services/game/game-history.service';
import { GameService } from './services/game/game.service';
import { MessageService } from './services/message/message.service';
import { PlayerService } from './services/player/player.service';
import { QuestionService } from './services/question/question.service';
import { QuizService } from './services/quiz/quiz.service';
import { TimerService } from './services/timer/timer.service';

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
            { name: GameHistory.name, schema: gameHistorySchema },
        ]),
    ],
    controllers: [AuthController, GameController, QuestionController, QuizController, GameHistoryController],
    providers: [
        GameGateway,
        MessageGateway,
        PlayerGateway,
        TimerGateway,
        AuthService,
        GameService,
        MessageService,
        PlayerService,
        QuestionService,
        QuizService,
        TimerService,
        Logger,
        GameHistoryService,
    ],
})
export class AppModule {}
