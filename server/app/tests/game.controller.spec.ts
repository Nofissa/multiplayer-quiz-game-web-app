/* eslint-disable @typescript-eslint/no-explicit-any */
import { GameController } from '@app/controllers/game/game.controller';
import { ChoiceDto } from '@app/model/dto/choice/choice.dto';
import { GameService } from '@app/services/game/game.service';
import { QuizService } from '@app/services/quiz/quiz.service';
import { EvaluationPayload } from '@common/evaluation-payload';
import { HttpStatus } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as sinon from 'sinon';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { firstChoiceStub } from './stubs/choices.stubs';
import { quizStub } from './stubs/quiz.stubs';

describe('gameController', () => {
    let gameControllerTest: GameController;
    let quizServiceTest: SinonStubbedInstance<QuizService>;
    let gameServiceTest: SinonStubbedInstance<GameService>;

    beforeEach(async () => {
        quizServiceTest = createStubInstance(QuizService);
        gameServiceTest = createStubInstance(GameService);
        const moduleRef = await Test.createTestingModule({
            controllers: [GameController],
            providers: [
                {
                    provide: QuizService,
                    useValue: quizServiceTest,
                },
                {
                    provide: GameService,
                    useValue: gameServiceTest,
                },
            ],
        }).compile();

        gameControllerTest = moduleRef.get<GameController>(GameController);
    });

    it('should be defined', () => {
        expect(gameControllerTest).toBeDefined();
    });

    describe('evaluateChoices', () => {
        const mockResponse = {
            status: sinon.stub().returnsThis(),
            send: sinon.stub().returnsThis(),
            json: sinon.stub().returnsThis(),
        };
        const choiceDto: ChoiceDto = {
            text: firstChoiceStub()[3].text,
            isCorrect: firstChoiceStub()[3].isCorrect,
        };
        const choicesDtoArray: ChoiceDto[] = [choiceDto];
        const correctAnswers = [quizStub().questions[0].choices[3]];
        const BONUS = 1.2;
        const mockEvaluationPayload: EvaluationPayload = { correctAnswers, score: quizStub().questions[0].points * BONUS };
        const questionIndexExist = 0;
        const questionIndexNotExist = 5;
        it('should return 200 OK if the choices are valid', async () => {
            quizServiceTest.getQuizById.resolves(quizStub());
            jest.spyOn(gameServiceTest, 'evaluateChoices').mockReturnValue(mockEvaluationPayload);
            await gameControllerTest.evaluateChoices(quizStub().id, questionIndexExist, choicesDtoArray, mockResponse as any);
            expect(mockResponse.status.calledWith(HttpStatus.OK)).toBeTruthy();
            expect(mockResponse.json.calledWith(mockEvaluationPayload)).toBeTruthy();
        });

        it('should return 400 Bad Request if the choices dont exist', async () => {
            quizServiceTest.getQuizById.resolves(quizStub());
            await gameControllerTest.evaluateChoices(quizStub().id, questionIndexNotExist, choicesDtoArray, mockResponse as any);
            expect(mockResponse.status.calledWith(HttpStatus.BAD_REQUEST)).toBeTruthy();
            expect(mockResponse.send.calledWith("Cette question n'existe pas")).toBeTruthy();
        });

        it('should return 500 Internal Server Error if an error occurs', async () => {
            quizServiceTest.getQuizById.rejects(quizStub());
            await gameControllerTest.evaluateChoices(quizStub().id, questionIndexNotExist, choicesDtoArray, mockResponse as any);
            expect(mockResponse.status.calledWith(HttpStatus.INTERNAL_SERVER_ERROR)).toBeTruthy();
            expect(mockResponse.send.calledWith('Une erreur est survenue')).toBeTruthy();
        });
    });
});
