import { Question, QuestionDocument } from '@app/model/database/question';
import { GameService } from '@app/services/game/game.service';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';

describe('GameService', () => {
    let gameServiceTest: GameService;
    let questionModelTest: QuestionDocument;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameService,
                {
                    provide: getModelToken(Question.name),
                    useValue: questionModelTest,
                },
            ],
        }).compile();
        gameServiceTest = module.get<GameService>(GameService);
    });

    it('should be defined', () => {
        expect(gameServiceTest).toBeDefined();
    });
});
