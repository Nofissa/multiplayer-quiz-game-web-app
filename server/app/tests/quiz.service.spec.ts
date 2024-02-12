/* eslint-disable @typescript-eslint/no-explicit-any */
import { QuizService } from '@app/services/quiz/quiz.service';
import { cleanData, connect, disconnect } from '@app/tests/helpers/mongodb.memory.test.helper';
import { quizStub } from '@app/tests/stubs/quiz.stubs';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';

import { Quiz, QuizDocument } from '@app/model/database/quiz';
import { QuizDto } from '@app/model/dto/quiz/quiz.dto';
import { getModelToken } from '@nestjs/mongoose';

describe('quizService', () => {
    let quizServiceTest: QuizService;
    let quizModelTest: Model<QuizDocument>;

    beforeAll(async () => {
        quizModelTest = {
            create: jest.fn(),
            find: jest.fn(),
            findOneAndReplace: jest.fn(),
            findOneAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
            findOne: jest.fn(),
        } as unknown as Model<QuizDocument>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                QuizService,
                Logger,
                {
                    provide: getModelToken(Quiz.name),
                    useValue: quizModelTest,
                },
            ],
        }).compile();

        quizServiceTest = module.get<QuizService>(QuizService);
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
        expect(quizServiceTest).toBeDefined();
    });

    describe('getQuizzes()', () => {
        const findSortMock = {
            sort: jest.fn().mockResolvedValue([quizStub()]),
        };

        const onlyVisibleTrue = true;
        const onlyVisibleFalse = false;

        it('getQuizzes() should get all quizzes if visibleOnly = false', async () => {
            jest.spyOn(quizModelTest, 'find').mockReturnValue(findSortMock as any);
            const quizzes = await quizServiceTest.getQuizzes(onlyVisibleFalse);
            expect(findSortMock.sort).toHaveBeenCalledWith({ lastModification: 1 });
            expect(quizzes).toEqual([quizStub()]);
        });
        it('getQuizzes() should get all quizzes if not visibleOnly', async () => {
            jest.spyOn(quizModelTest, 'find').mockReturnValue(findSortMock as any);
            const quizzes = await quizServiceTest.getQuizzes();
            expect(findSortMock.sort).toHaveBeenCalledWith({ lastModification: 1 });
            expect(quizzes).toEqual([quizStub()]);
        });
        it('getQuizzes() should get non hidden quizzes if visibleOnly = true', async () => {
            jest.spyOn(quizModelTest, 'find').mockReturnValue(findSortMock as any);
            const quizzes = await quizServiceTest.getQuizzes(onlyVisibleTrue);
            expect(findSortMock.sort).toHaveBeenCalledWith({ lastModified: 1 });
            expect(quizzes).toEqual([quizStub()]);
        });
    });

    describe('getQuizById()', () => {
        const onlyVisibleTrue = true;
        const onlyVisibleFalse = false;
        it('getQuizById() should get all quizzes if visibleOnly = false', async () => {
            jest.spyOn(quizModelTest, 'findOne').mockResolvedValue(quizStub());
            const quiz = await quizServiceTest.getQuizById(quizStub().id, onlyVisibleFalse);
            expect(quiz).toEqual(quizStub());
        });

        it('getQuizById() should get all quizzes if visibleOnly = undefined', async () => {
            jest.spyOn(quizModelTest, 'findOne').mockResolvedValue(quizStub());
            const quiz = await quizServiceTest.getQuizById(quizStub().id);
            expect(quiz).toEqual(quizStub());
        });
        it('getQuizById() should get non hidden quizzes if visibleOnly = true', async () => {
            jest.spyOn(quizModelTest, 'findOne').mockResolvedValue(quizStub());
            const quiz = await quizServiceTest.getQuizById(quizStub().id, onlyVisibleTrue);
            expect(quiz).toEqual(quizStub());
        });
    });

    describe('addQuiz()', () => {
        const addQuizDto: QuizDto = {
            id: quizStub().id,
            title: quizStub().title,
            description: quizStub().description,
            questions: quizStub().questions,
            duration: quizStub().duration,
            lastModification: quizStub().lastModification,
            isHidden: quizStub().isHidden,
        };
        it('addQuiz() should add a quiz', async () => {
            jest.spyOn(quizModelTest, 'create').mockResolvedValue(addQuizDto as any);
            const quiz = await quizServiceTest.addQuiz(addQuizDto);
            addQuizDto.lastModification = quiz.lastModification;
            expect(quiz).toEqual(addQuizDto);
        });

        it('addQuiz() should not add quiz when an error occurs', async () => {
            jest.spyOn(quizModelTest, 'create').mockRejectedValue(addQuizDto as any);
            await expect(quizServiceTest.addQuiz(addQuizDto)).rejects.toMatch('Failed to insert Quiz');
        });
    });

    describe('modifyQuiz', () => {
        const addQuizDto: QuizDto = {
            id: quizStub().id,
            title: quizStub().title,
            description: quizStub().description,
            questions: quizStub().questions,
            duration: quizStub().duration,
            lastModification: quizStub().lastModification,
            isHidden: quizStub().isHidden,
        };

        it('modifyQuiz() should modify a quiz', async () => {
            jest.spyOn(quizModelTest, 'findOneAndReplace').mockResolvedValue(addQuizDto);
            const quiz = await quizServiceTest.modifyQuiz(addQuizDto);
            addQuizDto.lastModification = quiz.lastModification;
            expect(quiz).toEqual(addQuizDto);
        });

        it('modifyQuiz() should not modify a quiz when an error occurs', async () => {
            jest.spyOn(quizModelTest, 'findOneAndReplace').mockRejectedValue(addQuizDto);
            await expect(quizServiceTest.modifyQuiz(addQuizDto)).rejects.toMatch('Failed to modify quiz');
        });
    });

    describe('hideQuizById', () => {
        const addQuizDto: QuizDto = {
            id: quizStub().id,
            title: quizStub().title,
            description: quizStub().description,
            questions: quizStub().questions,
            duration: quizStub().duration,
            lastModification: quizStub().lastModification,
            isHidden: false,
        };

        it('hideQuizById() should modify a quiz', async () => {
            jest.spyOn(quizModelTest, 'findOne').mockResolvedValue(addQuizDto);
            const quiz = await quizModelTest.findOne({ _id: addQuizDto.id });
            quiz.isHidden = true;
            quiz.lastModification = new Date();
            jest.spyOn(quizModelTest, 'findOneAndUpdate').mockResolvedValue(quiz);
            const quizUpdated = await quizServiceTest.hideQuizById(addQuizDto.id);
            addQuizDto.lastModification = quizUpdated.lastModification;
            addQuizDto.isHidden = true;
            expect(quizUpdated).toEqual(addQuizDto);
        });

        it('hideQuizById() should not modify a quiz when findOne returns null', async () => {
            jest.spyOn(quizModelTest, 'findOne').mockReturnValue(null);
            await expect(quizServiceTest.hideQuizById(addQuizDto.id)).rejects.toMatch(`Can't find quiz with ID ${addQuizDto.id}`);
        });

        it('hideQuizById() should not modify a quiz when an error occurs', async () => {
            jest.spyOn(quizModelTest, 'findOne').mockRejectedValue(addQuizDto);
            await expect(quizServiceTest.hideQuizById(addQuizDto.id)).rejects.toMatch('Failed to toggle quiz hidden state');
        });
    });

    describe('deleQuizById', () => {
        it('deleteQuizById should delete quiz', async () => {
            const quiz = await quizServiceTest.deleteQuizById(quizStub().id);
            expect(quiz).toEqual(undefined);
        });
        it('deleteQuizById should not delete quiz when an error occurs', async () => {
            jest.spyOn(quizModelTest, 'findByIdAndDelete').mockRejectedValue(quizStub());
            await expect(quizServiceTest.deleteQuizById(quizStub().id)).rejects.toMatch('Failed to delete quiz');
        });
    });
});
