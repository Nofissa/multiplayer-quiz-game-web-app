import { Question, QuestionDocument } from '@app/model/database/question';
import { ChoiceDto } from '@app/model/dto/choice/choice.dto';
import { GameService } from '@app/services/game/game.service';
import { EvaluationPayload } from '@common/evaluation-payload';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { firstChoiceStub } from './stubs/choices.stubs';
import { questionStub } from './stubs/question.stubs';

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

    describe('evaluateChoices', () => {
        const BONUS = 1.2;
        const choiceDto: ChoiceDto[] = firstChoiceStub();
        const question: Question = questionStub()[0];
        const correctAnswers = [firstChoiceStub()[3]];
        const NO_BONUS = 0;
        it('should return payload with bonus when all correct answers selected', () => {
            const payload: EvaluationPayload = gameServiceTest.evaluateChoices([choiceDto[3]], question);
            expect(payload).toEqual({ correctAnswers, score: question.points * BONUS });
        });
        it('should return payload with no bonus when bad answers', () => {
            const payload: EvaluationPayload = gameServiceTest.evaluateChoices(choiceDto, question);
            expect(payload).toEqual({ correctAnswers, score: NO_BONUS });
        });
    });
});
