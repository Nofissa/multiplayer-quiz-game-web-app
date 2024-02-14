/* eslint-disable @typescript-eslint/no-explicit-any */
import { QuizController } from '@app/controllers/quiz/quiz.controller';
import { QuizDto } from '@app/model/dto/quiz/quiz.dto';
import { QuizService } from '@app/services/quiz/quiz.service';
import { HttpStatus } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as sinon from 'sinon';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { quizStub } from './stubs/quiz.stubs';

describe('QuizController', () => {
    let quizControllerTest: QuizController;
    let quizServiceTest: SinonStubbedInstance<QuizService>;

    beforeEach(async () => {
        quizServiceTest = createStubInstance(QuizService);
        const moduleRef = await Test.createTestingModule({
            controllers: [QuizController],
            providers: [
                {
                    provide: QuizService,
                    useValue: quizServiceTest,
                },
            ],
        }).compile();

        quizControllerTest = moduleRef.get<QuizController>(QuizController);
    });

    it('should be defined', () => {
        expect(quizControllerTest).toBeDefined();
    });

    describe('getQuizzes', () => {
        const mockResponse = {
            status: sinon.stub().returnsThis(),
            send: sinon.stub().returnsThis(),
            json: sinon.stub().returnsThis(),
        };
        const onlyVisible = true;
        const mockResult = quizStub();
        it('should return all quizzes with 200 OK if they exist', async () => {
            quizServiceTest.getQuizzes.resolves([mockResult]);
            await quizControllerTest.getQuizzes(mockResponse as any, onlyVisible);
            expect(mockResponse.status.calledWith(HttpStatus.OK)).toBeTruthy();
            expect(mockResponse.json.calledWith([mockResult])).toBeTruthy();
        });
        it('should return 404 Not Found when no content', async () => {
            quizServiceTest.getQuizzes.rejects([mockResult]);
            await quizControllerTest.getQuizzes(mockResponse as any, onlyVisible);
            expect(mockResponse.status.calledWith(HttpStatus.NOT_FOUND)).toBeTruthy();
            expect(mockResponse.send.calledWith('Quizzes not found')).toBeTruthy();
        });
    });

    describe('getQuizById', () => {
        const mockResponse = {
            status: sinon.stub().returnsThis(),
            send: sinon.stub().returnsThis(),
            json: sinon.stub().returnsThis(),
        };
        const onlyVisible = true;
        const mockResult = quizStub();
        it('should return quiz with 200 OK if it exists', async () => {
            quizServiceTest.getQuizById.resolves(mockResult);
            await quizControllerTest.getQuizById(mockResult.id, mockResponse as any, onlyVisible);
            expect(mockResponse.status.calledWith(HttpStatus.OK)).toBeTruthy();
            expect(mockResponse.json.calledWith(mockResult)).toBeTruthy();
        });
        it('should return 404 Not Found with "cannot find quiz" if quiz = null', async () => {
            quizServiceTest.getQuizById.resolves(null);
            await quizControllerTest.getQuizById(mockResult.id, mockResponse as any, onlyVisible);
            expect(mockResponse.status.calledWith(HttpStatus.NOT_FOUND)).toBeTruthy();
            expect(mockResponse.send.called).toBeTruthy();
        });
        it('should return 404 not found when an error occurs', async () => {
            quizServiceTest.getQuizById.rejects(mockResult);
            await quizControllerTest.getQuizById(mockResult.id, mockResponse as any, onlyVisible);
            expect(mockResponse.status.calledWith(HttpStatus.NOT_FOUND)).toBeTruthy();
            expect(mockResponse.send.called).toBeTruthy();
        });
    });

    describe('addQuiz', () => {
        const addQuizDto: QuizDto = {
            id: quizStub().id,
            title: quizStub().title,
            description: quizStub().description,
            questions: quizStub().questions,
            duration: quizStub().duration,
            lastModification: quizStub().lastModification,
            isHidden: quizStub().isHidden,
        };
        const mockResponse = {
            status: sinon.stub().returnsThis(),
            send: sinon.stub().returnsThis(),
            json: sinon.stub().returnsThis(),
        };
        const mockResult = quizStub();
        it('should return 201 Created when successful', async () => {
            quizServiceTest.addQuiz.resolves(mockResult);
            await quizControllerTest.addQuiz(addQuizDto, mockResponse as any);
            expect(mockResponse.status.calledWith(HttpStatus.CREATED)).toBeTruthy();
            expect(mockResponse.json.calledWith(mockResult)).toBeTruthy();
        });

        it('should return 400 Bad Request when rejected', async () => {
            quizServiceTest.addQuiz.rejects(mockResult);
            await quizControllerTest.addQuiz(addQuizDto, mockResponse as any);
            expect(mockResponse.status.calledWith(HttpStatus.BAD_REQUEST)).toBeTruthy();
            expect(mockResponse.send.called).toBeTruthy();
        });
    });

    describe('upsertQuiz', () => {
        const modifyQuizDto: QuizDto = {
            id: quizStub().id,
            title: quizStub().title,
            description: quizStub().description,
            questions: quizStub().questions,
            duration: quizStub().duration,
            lastModification: quizStub().lastModification,
            isHidden: quizStub().isHidden,
        };

        const mockResponse = {
            status: sinon.stub().returnsThis(),
            send: sinon.stub().returnsThis(),
            json: sinon.stub().returnsThis(),
        };
        const mockResult = quizStub();

        it('should return 200 OK when successful', async () => {
            quizServiceTest.upsertQuiz.resolves(mockResult);
            await quizControllerTest.upsertQuiz(modifyQuizDto, mockResponse as any);
            expect(mockResponse.status.calledWith(HttpStatus.OK)).toBeTruthy();
            expect(mockResponse.json.calledWith(mockResult)).toBeTruthy();
        });

        it('should return 404 Not Found when rejected and send "cant find quiz to modify"', async () => {
            quizServiceTest.upsertQuiz.rejects(mockResult);
            await quizControllerTest.upsertQuiz(modifyQuizDto, mockResponse as any);
            expect(mockResponse.status.calledWith(HttpStatus.OK)).toBeTruthy();
            expect(mockResponse.send.called).toBeTruthy();
        });
    });

    describe('hideQuizById', () => {
        const mockResponse = {
            status: sinon.stub().returnsThis(),
            send: sinon.stub().returnsThis(),
            json: sinon.stub().returnsThis(),
            error: sinon.stub().returnsThis(),
        };
        const mockResult = quizStub();
        it('should return 200 OK when successful', async () => {
            quizServiceTest.hideQuizById.resolves(mockResult);
            await quizControllerTest.hideQuizById(mockResult.id, mockResponse as any);
            expect(mockResponse.status.calledWith(HttpStatus.OK)).toBeTruthy();
            expect(mockResponse.json.calledWith(mockResult)).toBeTruthy();
        });

        it('should return 404 Not Found when rejected and send "cant find quiz"', async () => {
            quizServiceTest.hideQuizById.rejects(mockResult);
            await quizControllerTest.hideQuizById(mockResult.id, mockResponse as any);
            expect(mockResponse.status.calledWith(HttpStatus.NOT_FOUND)).toBeTruthy();
            expect(mockResponse.send.called).toBeTruthy();
        });
    });

    describe('deleteQuizById', () => {
        const mockResponse = {
            status: sinon.stub().returnsThis(),
            send: sinon.stub().returnsThis(),
        };
        const mockResult = quizStub();
        it('should return 200 OK when successful', async () => {
            quizServiceTest.deleteQuizById.resolves();
            await quizControllerTest.deleteQuizById(mockResult.id, mockResponse as any);
            expect(mockResponse.status.calledWith(HttpStatus.OK)).toBeTruthy();
        });
        it('should return 404 Not Found when rejected and send "cant find quiz to delete"', async () => {
            quizServiceTest.deleteQuizById.rejects();
            await quizControllerTest.deleteQuizById(mockResult.id, mockResponse as any);
            expect(mockResponse.status.calledWith(HttpStatus.NOT_FOUND)).toBeTruthy();
            expect(mockResponse.send.called).toBeTruthy();
        });
    });
});
