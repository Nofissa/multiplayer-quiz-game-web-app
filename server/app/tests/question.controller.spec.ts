/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { QuestionController } from '@app/controllers/question/question.controller';
import { ChoiceDto } from '@app/model/dto/choice/choice.dto';
import { QuestionDto } from '@app/model/dto/question/question.dto';
import { QuestionService } from '@app/services/question/question.service';
import { firstChoiceStub } from '@app/tests/stubs/choices.stubs';
import { HttpStatus } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as sinon from 'sinon';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { questionStub } from './stubs/question.stubs';

describe('QuestionController', () => {
    let questionControllerTest: QuestionController;
    let questionServiceTest: SinonStubbedInstance<QuestionService>;

    beforeEach(async () => {
        questionServiceTest = createStubInstance(QuestionService);
        const moduleRef = await Test.createTestingModule({
            controllers: [QuestionController],
            providers: [
                {
                    provide: QuestionService,
                    useValue: questionServiceTest,
                },
            ],
        }).compile();

        questionControllerTest = moduleRef.get<QuestionController>(QuestionController);
    });

    it('should be defined', () => {
        expect(questionControllerTest).toBeDefined();
    });

    describe('getAllQuestions', () => {
        const mockResponse = {
            status: sinon.stub().returnsThis(),
            send: sinon.stub().returnsThis(),
            json: sinon.stub().returnsThis(),
        };
        const mockResult = questionStub();
        it('should return all questions with 200 OK if they exist', async () => {
            questionServiceTest.getAllQuestions.resolves(mockResult);
            await questionControllerTest.getAllQuestions(mockResponse as any);
            expect(mockResponse.status.calledWith(HttpStatus.OK)).toBeTruthy();
            expect(mockResponse.json.calledWith(mockResult)).toBeTruthy();
        });
        it('should return 404 Not Found when no content or error', async () => {
            questionServiceTest.getAllQuestions.rejects(mockResult);
            await questionControllerTest.getAllQuestions(mockResponse as any);
            expect(mockResponse.status.calledWith(HttpStatus.NOT_FOUND)).toBeTruthy();
            expect(mockResponse.send.calledWith('Cannot find questions')).toBeTruthy();
        });
    });

    describe('addQuestion', () => {
        const addQuestionDto: QuestionDto = {
            type: questionStub()[0].type,
            text: questionStub()[0].text,
            points: questionStub()[0].points,
            choices: questionStub()[0].choices,
            lastModification: questionStub()[0].lastModification,
        };
        const mockResponse = {
            status: sinon.stub().returnsThis(),
            send: sinon.stub().returnsThis(),
            json: sinon.stub().returnsThis(),
        };
        const mockResult = questionStub()[0];
        it('should return 201 Created when successful', async () => {
            questionServiceTest.addQuestion.resolves(mockResult);
            await questionControllerTest.addQuestion(addQuestionDto, mockResponse as any);
            expect(mockResponse.status.calledWith(HttpStatus.CREATED)).toBeTruthy();
            expect(mockResponse.json.calledWith(mockResult)).toBeTruthy();
        });

        it('should return 400 Bad Request when rejected', async () => {
            questionServiceTest.addQuestion.rejects(mockResult);
            await questionControllerTest.addQuestion(addQuestionDto, mockResponse as any);
            expect(mockResponse.status.calledWith(HttpStatus.BAD_REQUEST)).toBeTruthy();
            expect(mockResponse.send.calledWith('Cannot add question')).toBeTruthy();
        });
    });

    describe('modifyQuiz', () => {
        const modifyChoicesDto: ChoiceDto[] = firstChoiceStub();

        const modifyQuestionDto: QuestionDto = {
            type: questionStub()[0].type,
            text: questionStub()[0].text,
            points: questionStub()[0].points,
            choices: modifyChoicesDto,
            lastModification: questionStub()[0].lastModification,
        };

        const mockResponse = {
            status: sinon.stub().returnsThis(),
            send: sinon.stub().returnsThis(),
            json: sinon.stub().returnsThis(),
        };
        const mockResult = questionStub()[0];

        it('should return 200 OK when successful', async () => {
            questionServiceTest.updateQuestion.resolves(mockResult);
            await questionControllerTest.updateQuestion(modifyQuestionDto, mockResponse as any);
            expect(mockResponse.status.calledWith(HttpStatus.OK)).toBeTruthy();
            expect(mockResponse.json.calledWith(mockResult)).toBeTruthy();
        });

        it('should return 400 Bad Request when rejected and send "Error while updating question"', async () => {
            questionServiceTest.updateQuestion.rejects(mockResult);
            await questionControllerTest.updateQuestion(modifyQuestionDto, mockResponse as any);
            expect(mockResponse.status.calledWith(HttpStatus.BAD_REQUEST)).toBeTruthy();
            expect(mockResponse.send.calledWith('Error while updating question')).toBeTruthy();
        });
    });

    describe('deleteQuestionById', () => {
        const mockResponse = {
            status: sinon.stub().returnsThis(),
            send: sinon.stub().returnsThis(),
        };
        const mockResult = questionStub()[0];
        mockResult._id = '123456789';
        it('should return 200 OK when successful', async () => {
            questionServiceTest.deleteQuestionById.resolves();
            await questionControllerTest.deleteQuestionById(mockResult._id, mockResponse as any);
            expect(mockResponse.status.calledWith(HttpStatus.OK)).toBeTruthy();
        });
        it('should return 404 Not Found when rejected and send "cant find quiz to delete"', async () => {
            questionServiceTest.deleteQuestionById.rejects();
            await questionControllerTest.deleteQuestionById(mockResult._id, mockResponse as any);
            expect(mockResponse.status.calledWith(HttpStatus.NOT_FOUND)).toBeTruthy();
            expect(mockResponse.send.calledWith('Cant find question to delete')).toBeTruthy();
        });
    });
});
