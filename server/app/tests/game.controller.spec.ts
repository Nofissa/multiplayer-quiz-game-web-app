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

    // describe('getQuizzes', () => {
    //     const mockResponse = {
    //         status: sinon.stub().returnsThis(),
    //         send: sinon.stub().returnsThis(),
    //         json: sinon.stub().returnsThis(),
    //     };
    //     const onlyVisible = true;
    //     const mockResult = quizStub();
    //     it('should return all quizzes with 200 OK if they exist', async () => {
    //         quizServiceTest.getQuizzes.resolves([mockResult]);
    //         await gameControllerTest.getQuizzes(mockResponse as any, onlyVisible);
    //         expect(mockResponse.status.calledWith(HttpStatus.OK)).toBeTruthy();
    //         expect(mockResponse.json.calledWith([mockResult])).toBeTruthy();
    //     });
    //     it('should return 404 Not Found when no content', async () => {
    //         quizServiceTest.getQuizzes.rejects([mockResult]);
    //         await gameControllerTest.getQuizzes(mockResponse as any, onlyVisible);
    //         expect(mockResponse.status.calledWith(HttpStatus.NOT_FOUND)).toBeTruthy();
    //         expect(mockResponse.send.calledWith('Quizzes not found')).toBeTruthy();
    //     });
    // });

    // describe('getQuizById', () => {
    //     const mockResponse = {
    //         status: sinon.stub().returnsThis(),
    //         send: sinon.stub().returnsThis(),
    //         json: sinon.stub().returnsThis(),
    //     };
    //     const onlyVisible = true;
    //     const mockResult = quizStub();
    //     it('should return quiz with 200 OK if it exists', async () => {
    //         quizServiceTest.getQuizById.resolves(mockResult);
    //         await gameControllerTest.getQuizById(mockResult.id, mockResponse as any, onlyVisible);
    //         expect(mockResponse.status.calledWith(HttpStatus.OK)).toBeTruthy();
    //         expect(mockResponse.json.calledWith(mockResult)).toBeTruthy();
    //     });
    //     it('should return 404 Not Found with "cannot find quiz" if quiz = null', async () => {
    //         quizServiceTest.getQuizById.resolves(null);
    //         await gameControllerTest.getQuizById(mockResult.id, mockResponse as any, onlyVisible);
    //         expect(mockResponse.status.calledWith(HttpStatus.NOT_FOUND)).toBeTruthy();
    //         expect(mockResponse.send.calledWith('cannot find quiz')).toBeTruthy();
    //     });
    //     it('should return 404 not found when an error occurs', async () => {
    //         quizServiceTest.getQuizById.rejects(mockResult);
    //         await gameControllerTest.getQuizById(mockResult.id, mockResponse as any, onlyVisible);
    //         expect(mockResponse.status.calledWith(HttpStatus.NOT_FOUND)).toBeTruthy();
    //         expect(mockResponse.send.calledWith('error while getting the quiz')).toBeTruthy();
    //     });
    // });

    // describe('addQuiz', () => {
    //     const addQuizDto: QuizDto = {
    //         id: quizStub().id,
    //         title: quizStub().title,
    //         description: quizStub().description,
    //         questions: quizStub().questions,
    //         duration: quizStub().duration,
    //         lastModification: quizStub().lastModification,
    //         isHidden: quizStub().isHidden,
    //     };
    //     const mockResponse = {
    //         status: sinon.stub().returnsThis(),
    //         send: sinon.stub().returnsThis(),
    //         json: sinon.stub().returnsThis(),
    //     };
    //     const mockResult = quizStub();
    //     it('should return 201 Created when successful', async () => {
    //         quizServiceTest.addQuiz.resolves(mockResult);
    //         await gameControllerTest.addQuiz(addQuizDto, mockResponse as any);
    //         expect(mockResponse.status.calledWith(HttpStatus.CREATED)).toBeTruthy();
    //         expect(mockResponse.json.calledWith(mockResult)).toBeTruthy();
    //     });

    //     it('should return 400 Bad Request when rejected', async () => {
    //         quizServiceTest.addQuiz.rejects(mockResult);
    //         await gameControllerTest.addQuiz(addQuizDto, mockResponse as any);
    //         expect(mockResponse.status.calledWith(HttpStatus.BAD_REQUEST)).toBeTruthy();
    //         expect(mockResponse.send.calledWith('Cant add quiz')).toBeTruthy();
    //     });
    // });

    // describe('modifyQuiz', () => {
    //     const modifyQuizDto: QuizDto = {
    //         id: quizStub().id,
    //         title: quizStub().title,
    //         description: quizStub().description,
    //         questions: quizStub().questions,
    //         duration: quizStub().duration,
    //         lastModification: quizStub().lastModification,
    //         isHidden: quizStub().isHidden,
    //     };

    //     const mockResponse = {
    //         status: sinon.stub().returnsThis(),
    //         send: sinon.stub().returnsThis(),
    //         json: sinon.stub().returnsThis(),
    //     };
    //     const mockResult = quizStub();

    //     it('should return 200 OK when successful', async () => {
    //         quizServiceTest.modifyQuiz.resolves(mockResult);
    //         await gameControllerTest.modifyQuiz(modifyQuizDto, mockResponse as any);
    //         expect(mockResponse.status.calledWith(HttpStatus.OK)).toBeTruthy();
    //         expect(mockResponse.json.calledWith(mockResult)).toBeTruthy();
    //     });

    //     it('should return 404 Not Found when rejected and send "cant find quiz to modify"', async () => {
    //         quizServiceTest.modifyQuiz.rejects(mockResult);
    //         await gameControllerTest.modifyQuiz(modifyQuizDto, mockResponse as any);
    //         expect(mockResponse.status.calledWith(HttpStatus.OK)).toBeTruthy();
    //         expect(mockResponse.send.calledWith('Cant find quiz to modify')).toBeTruthy();
    //     });
    // });

    // describe('hideQuizById', () => {
    //     const mockResponse = {
    //         status: sinon.stub().returnsThis(),
    //         send: sinon.stub().returnsThis(),
    //         json: sinon.stub().returnsThis(),
    //         error: sinon.stub().returnsThis(),
    //     };
    //     const mockResult = quizStub();
    //     it('should return 200 OK when successful', async () => {
    //         quizServiceTest.hideQuizById.resolves(mockResult);
    //         await gameControllerTest.hideQuizById(mockResult.id, mockResponse as any);
    //         expect(mockResponse.status.calledWith(HttpStatus.OK)).toBeTruthy();
    //         expect(mockResponse.json.calledWith(mockResult)).toBeTruthy();
    //     });

    //     it('should return 404 Not Found when rejected and send "cant find quiz"', async () => {
    //         quizServiceTest.hideQuizById.rejects(mockResult);
    //         await gameControllerTest.hideQuizById(mockResult.id, mockResponse as any);
    //         expect(mockResponse.status.calledWith(HttpStatus.NOT_FOUND)).toBeTruthy();
    //         expect(mockResponse.send.calledWith('Cant find quiz to hide')).toBeTruthy();
    //     });
    // });

    // describe('deleteQuizById', () => {
    //     const mockResponse = {
    //         status: sinon.stub().returnsThis(),
    //         send: sinon.stub().returnsThis(),
    //     };
    //     const mockResult = quizStub();
    //     it('should return 200 OK when successful', async () => {
    //         quizServiceTest.deleteQuizById.resolves();
    //         await gameControllerTest.deleteQuizById(mockResult.id, mockResponse as any);
    //         expect(mockResponse.status.calledWith(HttpStatus.OK)).toBeTruthy();
    //     });
    //     it('should return 404 Not Found when rejected and send "cant find quiz to delete"', async () => {
    //         quizServiceTest.deleteQuizById.rejects();
    //         await gameControllerTest.deleteQuizById(mockResult.id, mockResponse as any);
    //         expect(mockResponse.status.calledWith(HttpStatus.NOT_FOUND)).toBeTruthy();
    //         expect(mockResponse.send.calledWith('Cant find quiz to delete')).toBeTruthy();
    //     });
    // });
});
