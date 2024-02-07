import { QuizController } from '@app/controllers/quiz/quiz.controller';
import { Quiz } from '@app/model/database/quiz';
import { QuizService } from '@app/services/quiz/quiz.service';
import { quizStub } from '@app/tests/stubs/quiz.stubs';
import { HttpStatus } from '@nestjs/common';
import { Test } from '@nestjs/testing';

jest.mock('@app/__mocks__/quiz.service');

describe('QuizController', () => {
    let quizControllerTest: QuizController;
    let quizServiceTest: QuizService;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            controllers: [QuizController],
            providers: [QuizService],
        }).compile();

        quizControllerTest = moduleRef.get<QuizController>(QuizController);
        quizServiceTest = moduleRef.get<QuizService>(QuizService);
        jest.clearAllMocks();
    });

    describe('getAllQuizzes', () => {
        it('should return all quizzes', () => {
            const quiz: Quiz[] = [quizStub()];

            const responseMock = {
                status: jest.fn().mockReturnThis(),
                body: jest.fn(),
            } as unknown as Response;

            jest.spyOn(quizServiceTest, 'getAllQuizzes').mockResolvedValue(quiz);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            quizControllerTest.getAllQuizzes(responseMock as any);

            expect(responseMock.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(responseMock.body).toHaveBeenCalledWith(quiz);
        });
    });
});
