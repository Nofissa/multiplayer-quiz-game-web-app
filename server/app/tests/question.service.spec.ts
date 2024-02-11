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
        it('addQuiz() should add a quiz if the question doesnt already exists in the DB', async () => {
            jest.spyOn(questionModelTest, 'create').mockResolvedValue(addQuestionDto as any);
            jest.spyOn(questionModelTest, 'findOne').mockResolvedValue(null);
            const question = await questionServiceTest.addQuestion(addQuestionDto);
            addQuestionDto.lastModification = question.lastModification;
            expect(question).toEqual(addQuestionDto);
        });

        it('addQuestion should not add question when it already exists in the DB', async () => {
            jest.spyOn(questionModelTest, 'findOne').mockResolvedValue(addQuestionDto);
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
            type: questionStub()[0].type,
            text: questionStub()[0].text,
            points: questionStub()[0].points,
            choices: questionStub()[0].choices,
            lastModification: questionStub()[0].lastModification,
        };
        updateQuestionDto._id = '123456789';

        it('updateQuestion() should modify a question if the modified question is correct', async () => {
            jest.spyOn(questionModelTest, 'findOneAndReplace').mockResolvedValue(updateQuestionDto);
            jest.spyOn(questionModelTest, 'findOne').mockResolvedValue(null);
            const question = await questionServiceTest.updateQuestion(updateQuestionDto);
            updateQuestionDto.lastModification = question.lastModification;
            expect(questionModelTest.findOneAndReplace).toHaveBeenCalledWith({ _id: updateQuestionDto._id }, updateQuestionDto, { new: true });
            expect(question).toEqual(updateQuestionDto);
        });

        it('updateQuestion() should not modify a question if the modified question is incorrect', async () => {
            jest.spyOn(questionModelTest, 'findOne').mockResolvedValue(updateQuestionDto);
            await expect(questionServiceTest.updateQuestion(updateQuestionDto)).rejects.toMatch('Invalid question');
        });

        it('updateQuestion should not add question when an error occurs', async () => {
            jest.spyOn(questionModelTest, 'findOneAndReplace').mockRejectedValue(updateQuestionDto as any);
            jest.spyOn(questionModelTest, 'findOne').mockResolvedValue(null);
            await expect(questionServiceTest.updateQuestion(updateQuestionDto)).rejects.toMatch('Failed to update question');
        });
    });

    // describe('hideQuizById', () => {
    //     const addQuizDto: QuestionDto = {
    //         id: questionStub().id,
    //         title: questionStub().title,
    //         description: questionStub().description,
    //         questions: questionStub().questions,
    //         duration: questionStub().duration,
    //         lastModification: questionStub().lastModification,
    //         isHidden: false,
    //     };

    //     it('hideQuizById() should modify a quiz', async () => {
    //         jest.spyOn(questionModelTest, 'findOne').mockResolvedValue(addQuizDto);
    //         const quiz = await questionModelTest.findOne({ _id: addQuizDto.id });
    //         quiz.isHidden = true;
    //         quiz.lastModification = new Date();
    //         jest.spyOn(questionModelTest, 'findOneAndUpdate').mockResolvedValue(quiz);
    //         const quizUpdated = await questionServiceTest.hideQuizById(addQuizDto.id);
    //         addQuizDto.lastModification = quizUpdated.lastModification;
    //         addQuizDto.isHidden = true;
    //         expect(quizUpdated).toEqual(addQuizDto);
    //     });

    //     it('hideQuizById() should not modify a quiz when findOne returns null', async () => {
    //         jest.spyOn(questionModelTest, 'findOne').mockReturnValue(null);
    //         await expect(questionServiceTest.hideQuizById(addQuizDto.id)).rejects.toMatch(`Can't find quiz with ID ${addQuizDto.id}`);
    //     });

    //     it('hideQuizById() should not modify a quiz when an error occurs', async () => {
    //         jest.spyOn(questionModelTest, 'findOne').mockRejectedValue(addQuizDto);
    //         await expect(questionServiceTest.hideQuizById(addQuizDto.id)).rejects.toMatch('Failed to toggle quiz hidden state');
    //     });
    // });

    // describe('deleQuizById', () => {
    //     it('deleteQuizById should delete quiz', async () => {
    //         const quiz = await questionServiceTest.deleteQuizById(questionStub().id);
    //         expect(quiz).toEqual(undefined);
    //     });
    //     it('deleteQuizById should not delete quiz when an error occurs', async () => {
    //         jest.spyOn(questionModelTest, 'findByIdAndDelete').mockRejectedValue(questionStub());
    //         await expect(questionServiceTest.deleteQuizById(questionStub().id)).rejects.toMatch('Failed to delete quiz');
    //     });
    // });
});
