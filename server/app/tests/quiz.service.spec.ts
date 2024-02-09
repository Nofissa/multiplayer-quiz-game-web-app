/* eslint-disable @typescript-eslint/no-explicit-any */
import { QuizService } from '@app/services/quiz/quiz.service';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
// import { MongoMemoryServer } from 'mongodb-memory-server';
import { cleanData, connect, disconnect } from '@app/tests/helpers/mongodb.memory.test.helper';
import { quizStub } from '@app/tests/stubs/quiz.stubs';

import { Quiz, QuizDocument } from '@app/model/database/quiz';
import { QuizDto } from '@app/model/dto/quiz/quiz.dto';
import { getModelToken } from '@nestjs/mongoose';

describe('quizService', () => {
    let quizServiceTest: QuizService;
    let quizModelTest: Model<QuizDocument>;

    beforeAll(async () => {
        // notice that only the functions we call from the model are mocked
        // we can´t use sinon because mongoose Model is an interface
        quizModelTest = {
            countDocuments: jest.fn(),
            insertMany: jest.fn(),
            create: jest.fn(),
            find: jest.fn(),
            findOneAndReplace: jest.fn(),
            findOneAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
            sort: jest.fn(),
            findOne: jest.fn(),
            deleteOne: jest.fn(),
            update: jest.fn(),
            updateOne: jest.fn(),
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
    });

    afterAll(async () => {
        await disconnect();
    });

    it('should be defined', () => {
        expect(quizServiceTest).toBeDefined();
    });

    describe('getAllQuizzes()', () => {
        it('getAllQuizzes() should get all quizzes', async () => {
            jest.spyOn(quizModelTest, 'find').mockResolvedValue([quizStub()]);
            const quizzes = await quizServiceTest.getAllQuizzes();
            expect(quizzes).toEqual([quizStub()]);
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
