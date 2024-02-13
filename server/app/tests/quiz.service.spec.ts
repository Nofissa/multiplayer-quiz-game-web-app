/* eslint-disable no-underscore-dangle */
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

    describe('getQuizzes', () => {
        const findSortMock = {
            sort: jest.fn().mockResolvedValue([quizStub()]),
        };

        const onlyVisibleTrue = true;
        const onlyVisibleFalse = false;

        it('should get all quizzes if visibleOnly = false', async () => {
            jest.spyOn(quizModelTest, 'find').mockReturnValue(findSortMock as any);
            const quizzes = await quizServiceTest.getQuizzes(onlyVisibleFalse);
            expect(findSortMock.sort).toHaveBeenCalledWith({ lastModification: 1 });
            expect(quizzes).toEqual([quizStub()]);
        });
        it('should get all quizzes if not visibleOnly', async () => {
            jest.spyOn(quizModelTest, 'find').mockReturnValue(findSortMock as any);
            const quizzes = await quizServiceTest.getQuizzes();
            expect(findSortMock.sort).toHaveBeenCalledWith({ lastModification: 1 });
            expect(quizzes).toEqual([quizStub()]);
        });
        it('should get non hidden quizzes if visibleOnly = true', async () => {
            jest.spyOn(quizModelTest, 'find').mockReturnValue(findSortMock as any);
            const quizzes = await quizServiceTest.getQuizzes(onlyVisibleTrue);
            expect(findSortMock.sort).toHaveBeenCalledWith({ lastModified: 1 });
            expect(quizzes).toEqual([quizStub()]);
        });
    });

    describe('getQuizById', () => {
        it('should get all quizzes if visibleOnly = false', async () => {
            jest.spyOn(quizModelTest, 'findOne').mockResolvedValue(quizStub());
            const quiz = await quizServiceTest.getQuizById(quizStub()._id, false);
            expect(quiz).toEqual(quizStub());
        });

        it('should get all quizzes if visibleOnly = undefined', async () => {
            jest.spyOn(quizModelTest, 'findOne').mockResolvedValue(quizStub());
            const quiz = await quizServiceTest.getQuizById(quizStub()._id);
            expect(quiz).toEqual(quizStub());
        });

        it('should get non hidden quizzes if visibleOnly = true', async () => {
            jest.spyOn(quizModelTest, 'findOne').mockResolvedValue(quizStub());
            const quiz = await quizServiceTest.getQuizById(quizStub()._id, true);
            expect(quiz).toEqual(quizStub());
        });
    });

    describe('addQuiz', () => {
        const addQuizDto: QuizDto = {
            _id: quizStub()._id,
            id: quizStub().id,
            title: quizStub().title,
            description: quizStub().description,
            questions: quizStub().questions,
            duration: quizStub().duration,
            lastModification: quizStub().lastModification,
            isHidden: quizStub().isHidden,
        };

        it('should add a quiz with a new lastModification', async () => {
            jest.spyOn(quizModelTest, 'create').mockResolvedValue({ ...addQuizDto } as any);
            const quiz = await quizServiceTest.addQuiz(addQuizDto);

            expect(quizModelTest.create).toHaveBeenCalledWith(addQuizDto);
            expect(quiz.lastModification).not.toEqual(addQuizDto.lastModification);
        });

        it('addQuiz() should not add quiz when an error occurs', async () => {
            jest.spyOn(quizModelTest, 'create').mockRejectedValue(addQuizDto as any);
            await expect(quizServiceTest.addQuiz(addQuizDto)).rejects.toMatch('Failed to insert Quiz');
        });
    });

    describe('upsertQuiz', () => {
        const upsertQuizDto: QuizDto = {
            _id: quizStub()._id,
            id: quizStub().id,
            title: quizStub().title,
            description: quizStub().description,
            questions: quizStub().questions,
            duration: quizStub().duration,
            lastModification: quizStub().lastModification,
            isHidden: quizStub().isHidden,
        };

        it('should modify a quiz lastModification field', async () => {
            jest.spyOn(quizModelTest, 'findOneAndReplace').mockResolvedValue({ ...upsertQuizDto });
            const quiz = await quizServiceTest.upsertQuiz(upsertQuizDto);

            expect(quiz.lastModification).not.toEqual(upsertQuizDto.lastModification);
        });

        it('should update a quiz if it exists', async () => {
            jest.spyOn(quizModelTest, 'findOne').mockResolvedValue({ ...upsertQuizDto });
            await quizServiceTest.upsertQuiz(upsertQuizDto);

            expect(quizModelTest.findOneAndReplace).toHaveBeenCalled();
        });

        it("should create a quiz if it doesn't exists", async () => {
            jest.spyOn(quizModelTest, 'findOne').mockResolvedValue(null);
            jest.spyOn(quizModelTest, 'create').mockResolvedValue({ ...upsertQuizDto } as any);
            await quizServiceTest.upsertQuiz(upsertQuizDto);

            expect(quizModelTest.create).toHaveBeenCalledWith(upsertQuizDto);
        });

        it('should not modify a quiz when an error occurs', async () => {
            jest.spyOn(quizModelTest, 'findOne').mockResolvedValue(upsertQuizDto);
            jest.spyOn(quizModelTest, 'findOneAndReplace').mockRejectedValue(upsertQuizDto);
            await expect(quizServiceTest.upsertQuiz(upsertQuizDto)).rejects.toMatch('Failed to modify quiz');
        });
    });

    describe('hideQuizById', () => {
        const hideQuizDto: QuizDto = {
            _id: quizStub()._id,
            id: quizStub().id,
            title: quizStub().title,
            description: quizStub().description,
            questions: quizStub().questions,
            duration: quizStub().duration,
            lastModification: quizStub().lastModification,
            isHidden: true,
        };

        it('should toggle a quiz isHidden field to false', async () => {
            hideQuizDto.isHidden = true;
            jest.spyOn(quizModelTest, 'findOne').mockResolvedValue({ ...hideQuizDto });
            const quiz = await quizModelTest.findOne({ _id: hideQuizDto._id });
            quiz.isHidden = !hideQuizDto.isHidden;

            jest.spyOn(quizModelTest, 'findOneAndUpdate').mockResolvedValue(quiz);
            const quizUpdated = await quizServiceTest.hideQuizById(hideQuizDto._id);

            expect(quizUpdated.isHidden).not.toEqual(hideQuizDto.isHidden);
        });

        it('should toggle a quiz isHidden field to true', async () => {
            hideQuizDto.isHidden = false;
            jest.spyOn(quizModelTest, 'findOne').mockResolvedValue({ ...hideQuizDto });
            const quiz = await quizModelTest.findOne({ _id: hideQuizDto._id });
            quiz.isHidden = !hideQuizDto.isHidden;

            jest.spyOn(quizModelTest, 'findOneAndUpdate').mockResolvedValue(quiz);
            const quizUpdated = await quizServiceTest.hideQuizById(hideQuizDto._id);

            expect(quizUpdated.isHidden).not.toEqual(hideQuizDto.isHidden);
        });

        it('should not modify a quiz when no quiz matches passed ID', async () => {
            jest.spyOn(quizModelTest, 'findOne').mockReturnValue(null);

            await expect(quizServiceTest.hideQuizById(hideQuizDto._id)).rejects.toMatch(`Can't find quiz with ID ${hideQuizDto._id}`);
        });

        it('should not modify a quiz when an error occurs', async () => {
            jest.spyOn(quizModelTest, 'findOne').mockRejectedValue(hideQuizDto);

            await expect(quizServiceTest.hideQuizById(hideQuizDto._id)).rejects.toMatch('Failed to toggle quiz hidden state');
        });
    });

    describe('deleQuizById', () => {
        it('should delete quiz', async () => {
            const quiz = await quizServiceTest.deleteQuizById(quizStub()._id);

            expect(quiz).toEqual(undefined);
        });

        it('should not delete quiz when an error occurs', async () => {
            jest.spyOn(quizModelTest, 'findByIdAndDelete').mockRejectedValue(quizStub());

            await expect(quizServiceTest.deleteQuizById(quizStub()._id)).rejects.toMatch('Failed to delete quiz');
        });
    });
});
