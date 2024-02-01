import { Question } from '@app/model/database/question';
import { Quiz, QuizDocument } from '@app/model/database/quiz';
import { UpsertQuestionDto } from '@app/model/dto/question/upsert-question.dto';
import { UpsertQuizDto } from '@app/model/dto/quiz/upsert-quiz.dto';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class QuizService {
    constructor(
        @InjectModel(Quiz.name) public model: Model<QuizDocument>,
        private readonly logger: Logger,
    ) {
        this.start();
    }

    async start() {
        if ((await this.model.countDocuments()) === 0) {
            // TODO: remove
            await this.populateDB();
        }
    }

    async populateDB(): Promise<void> {
        const questions: UpsertQuestionDto[] = [
            {
                question: 'Quelle est la valeur de la constante R dans la formule pV = nRT',
                answers: [
                    { answer: '3.14 V/m^2', isCorrect: false },
                    { answer: '2.72 C/s', isCorrect: false },
                    { answer: '6.022x10^23 mol/N', isCorrect: false },
                    { answer: '8.31 J/mol/K', isCorrect: true },
                ],
                pointValue: 100,
                timeInSeconds: 10,
                lastModified: new Date(),
            },
            {
                question: "En quelle année la compagnie d'automobile Volkswagen a-t-elle été fondée?",
                answers: [
                    { answer: '1928', isCorrect: false },
                    { answer: '1987', isCorrect: false },
                    { answer: '1947', isCorrect: false },
                    { answer: '1937', isCorrect: true },
                ],
                pointValue: 30,
                timeInSeconds: 30,
                lastModified: new Date('2024-01-20 18:43:27'),
            },
        ];

        const quizzes: UpsertQuizDto[] = [
            {
                title: 'Quiz 1',
                description: 'Quiz 1 description',
                questions,
                lastModified: new Date(),
                isHidden: true,
            },
            {
                title: 'Quiz 2',
                description: 'Quiz 2 description',
                questions,
                lastModified: new Date('2024-01-20 18:43:27'),
                isHidden: false,
            },
        ];

        this.logger.log('THIS ADDS DATA TO THE DATABASE, DO NOT USE OTHERWISE');
        await this.model.insertMany(quizzes);
    }

    async getAllQuizzes(): Promise<Quiz[]> {
        return await this.model.find({}).sort({ lastModified: 1 });
    }

    async addQuiz(dto: UpsertQuizDto): Promise<void> {
        dto.lastModified = new Date();
        // eslint-disable-next-line no-underscore-dangle
        delete dto._id;
        dto.questions.forEach((x) => {
            // eslint-disable-next-line no-underscore-dangle
            delete x._id;
        });

        try {
            await this.model.create(dto);
        } catch (error) {
            return Promise.reject(`Failed to insert Quiz: ${error}`);
        }
    }

    async modifyQuiz(dto: UpsertQuizDto): Promise<Quiz> {
        dto.lastModified = new Date();

        try {
            // eslint-disable-next-line no-underscore-dangle
            return await this.model.findOneAndReplace({ _id: dto._id }, dto, { new: true });
        } catch (error) {
            return Promise.reject(`Failed to insert quiz: ${error}`);
        }
    }

    async deleteQuizById(id: string): Promise<Quiz> {
        try {
            return await this.model.findByIdAndDelete(id, { new: true });
        } catch (error) {
            return Promise.reject(`Failed to delete quiz: ${error}`);
        }
    }

    async modifyQuestionInQuiz(id: string, questionId: string): Promise<Question> {
        try {
            return await this.model.findOneAndUpdate({ _id: id }, { $set: { questions: { _id: questionId } } }, { new: true });
        } catch (error) {
            return Promise.reject(`Failed to modify question: ${error}`);
        }
    }

    async deleteQuestionInQuizbyId(id: string, questionId: string): Promise<Question> {
        try {
            return await this.model.findOneAndUpdate({ _id: id }, { $pull: { questions: { _id: questionId } } }, { new: true });
        } catch (error) {
            return Promise.reject(`Failed to delete question: ${error}`);
        }
    }
}
