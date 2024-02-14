/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { QuestionService } from '@app/services/question/question.service';
import { cleanData, connect, disconnect } from '@app/tests/helpers/mongodb.memory.test.helper';
import { questionStub } from '@app/tests/stubs/question.stubs';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';

import { Question, QuestionDocument } from '@app/model/database/question';
import { QuestionDto } from '@app/model/dto/question/question.dto';
import { getModelToken } from '@nestjs/mongoose';

describe('QuestionService', () => {
    let questionServiceTest: QuestionService;
    let questionModelTest: Model<QuestionDocument>;

    beforeAll(async () => {
        questionModelTest = {
            create: jest.fn(),
            find: jest.fn(),
            findOneAndReplace: jest.fn(),
            findOneAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
            findOne: jest.fn(),
        } as unknown as Model<QuestionDocument>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                QuestionService,
                Logger,
                {
                    provide: getModelToken(Question.name),
                    useValue: questionModelTest,
                },
            ],
        }).compile();

        questionServiceTest = module.get<QuestionService>(QuestionService);
        await connect();
    });
    beforeEach(async () => {
        await cleanData();
        jest.clearAllMocks();
    });

    afterAll(async () => {
        await disconnect();
    });

    it('should be defined', () => {
        expect(questionServiceTest).toBeDefined();
    });

    describe('getAllQuestions()', () => {
        const findSortMock = {
            sort: jest.fn().mockResolvedValue(questionStub()),
        };

        it('getQuizzes() should get all question', async () => {
            jest.spyOn(questionModelTest, 'find').mockReturnValue(findSortMock as any);
            const quizzes = await questionServiceTest.getAllQuestions();
            expect(findSortMock.sort).toHaveBeenCalledWith({ lastModification: -1 });
            expect(quizzes).toEqual(questionStub());
        });
    });

    describe('addQuestion()', () => {
        const addQuestionDto: QuestionDto = {
            type: questionStub()[0].type,
            text: questionStub()[0].text,
            points: questionStub()[0].points,
            choices: questionStub()[0].choices,
            lastModification: questionStub()[0].lastModification,
        };

        const addQuestionDtoId: QuestionDto = {
            _id: '123456789012345678901234',
            type: questionStub()[0].type,
            text: questionStub()[0].text,
            points: questionStub()[0].points,
            choices: questionStub()[0].choices,
            lastModification: questionStub()[0].lastModification,
        };

        it('addQuiz() should add a quiz if the question doesnt already exists in the DB', async () => {
            jest.spyOn(questionModelTest, 'create').mockResolvedValue(addQuestionDto as any);
            jest.spyOn(questionModelTest, 'findOne').mockResolvedValue(null);
            const question = await questionServiceTest.addQuestion(addQuestionDto);
            addQuestionDto.lastModification = question.lastModification;
            expect(question).toEqual(addQuestionDto);
        });

        it('addQuestion should not add question when it already exists in the DB', async () => {
            jest.spyOn(questionModelTest, 'findOne').mockResolvedValue(addQuestionDtoId);
            await expect(questionServiceTest.addQuestion(addQuestionDto)).rejects.toMatch('Invalid question');
        });

        it('addQuestion should not add question when an error occurs', async () => {
            jest.spyOn(questionModelTest, 'create').mockRejectedValue(addQuestionDto as any);
            jest.spyOn(questionModelTest, 'findOne').mockResolvedValue(null);
            await expect(questionServiceTest.addQuestion(addQuestionDto)).rejects.toMatch('Failed to insert question');
        });
    });

    describe('updateQuestion', () => {
        const updateQuestionDto: QuestionDto = {
            _id: questionStub()[0]._id,
            type: questionStub()[0].type,
            text: questionStub()[0].text,
            points: questionStub()[0].points,
            choices: questionStub()[0].choices,
            lastModification: questionStub()[0].lastModification,
        };

        const updateQuestionDtoId: QuestionDto = {
            _id: '123456789012345678901234',
            type: questionStub()[0].type,
            text: questionStub()[0].text,
            points: questionStub()[0].points,
            choices: questionStub()[0].choices,
            lastModification: questionStub()[0].lastModification,
        };

        it('updateQuestion() should modify a question if the modified question is correct', async () => {
            jest.spyOn(questionModelTest, 'findOneAndReplace').mockResolvedValue(updateQuestionDto);
            jest.spyOn(questionModelTest, 'findOne').mockResolvedValue(null);
            const question = await questionServiceTest.updateQuestion(updateQuestionDto);
            updateQuestionDto.lastModification = question.lastModification;
            expect(questionModelTest.findOneAndReplace).toHaveBeenCalledWith({ _id: updateQuestionDto._id }, updateQuestionDto, { new: true });
            expect(question).toEqual(updateQuestionDto);
        });

        it('updateQuestion() should not modify a question if the modified question is incorrect', async () => {
            jest.spyOn(questionModelTest, 'findOne').mockResolvedValue(updateQuestionDtoId);
            await expect(questionServiceTest.updateQuestion(updateQuestionDto)).rejects.toMatch('Invalid question');
        });

        it('updateQuestion should not add question when an error occurs', async () => {
            jest.spyOn(questionModelTest, 'findOneAndReplace').mockRejectedValue(updateQuestionDto as any);
            jest.spyOn(questionModelTest, 'findOne').mockResolvedValue(null);
            await expect(questionServiceTest.updateQuestion(updateQuestionDto)).rejects.toMatch('Failed to update question');
        });
    });

    describe('deleteQuestionById', () => {
        it('deleteQuestionById should delete question', async () => {
            const quiz = await questionServiceTest.deleteQuestionById(questionStub()[0]._id);
            expect(quiz).toEqual(undefined);
        });
        it('deleteQuestionById should not delete question when an error occurs', async () => {
            jest.spyOn(questionModelTest, 'findByIdAndDelete').mockRejectedValue(questionStub()[0]);
            await expect(questionServiceTest.deleteQuestionById(questionStub()[0]._id)).rejects.toMatch('Failed to delete question');
        });
    });

    describe('validateQuestion', () => {
        const validateQuestionDto: QuestionDto = {
            _id: questionStub()[0]._id,
            type: questionStub()[0].type,
            text: questionStub()[0].text,
            points: questionStub()[0].points,
            choices: questionStub()[0].choices,
            lastModification: questionStub()[0].lastModification,
        };
        const validateQuestionDtoCopy = { ...validateQuestionDto, _id: '341941409194710' };
        it('validateQuestion should return true if the question doesnt exist in the bd', async () => {
            jest.spyOn(questionModelTest, 'findOne').mockResolvedValue(null);
            const bool = await questionServiceTest.validateQuestion(validateQuestionDto);
            expect(bool).toEqual(true);
        });

        it('validateQuestion should return false if question._id !== dto._id the in the bd', async () => {
            jest.spyOn(questionModelTest, 'findOne').mockResolvedValue(validateQuestionDtoCopy);
            const bool = await questionServiceTest.validateQuestion(validateQuestionDto);
            expect(bool).toEqual(false);
        });
        it('validateQuestion should return true if question._id === dto._id the in the bd', async () => {
            jest.spyOn(questionModelTest, 'findOne').mockResolvedValue(validateQuestionDto);
            const bool = await questionServiceTest.validateQuestion(validateQuestionDto);
            expect(bool).toEqual(true);
        });
    });
});
