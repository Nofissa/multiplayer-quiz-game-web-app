import { Quiz, QuizDocument } from '@app/model/database/quiz';
import { QuizDto } from '@app/model/dto/quiz/quiz.dto';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class QuizService {
    constructor(
        @InjectModel(Quiz.name) public model: Model<QuizDocument>,
        private readonly logger: Logger,
    ) {
        // this.start();
    }

    // async start() {
    //     if ((await this.model.countDocuments()) === 0) {
    //         // TODO: remove
    //         await this.populateDB();
    //     }
    // }

    // async populateDB(): Promise<void> {
    //     const questions: QuizQuestionDto[] = [
    //         {
    //             text: 'Quelle est la valeur de la constante R dans la formule pV = nRT',
    //             type: 'QCM',
    //             choices: [
    //                 { text: '3.14 V/m^2', isCorrect: false },
    //                 { text: '2.72 C/s', isCorrect: false },
    //                 { text: '6.022x10^23 mol/N', isCorrect: false },
    //                 { text: '8.31 J/mol/K', isCorrect: true },
    //             ],
    //             points: 100,
    //             lastModification: new Date(),
    //         },
    //         {
    //             text: "En quelle année la compagnie d'automobile Volkswagen a-t-elle été fondée?",
    //             type: 'QCM',
    //             choices: [
    //                 { text: '1928', isCorrect: false },
    //                 { text: '1987', isCorrect: false },
    //                 { text: '1947', isCorrect: false },
    //                 { text: '1937', isCorrect: true },
    //             ],
    //             points: 30,
    //             lastModification: new Date('2024-01-20 18:43:27'),
    //         },
    //     ];

    //     const quizzes: QuizDto[] = [
    //         {
    //             title: 'Quiz 1',
    //             id: '4d5e6f',
    //             description: 'Quiz 1 description',
    //             questions,
    //             duration: 40,
    //             lastModification: new Date(),
    //             isHidden: true,
    //         },
    //         {
    //             title: 'Quiz 2',
    //             id: '1a2b3c',
    //             description: 'Quiz 2 description',
    //             questions,
    //             duration: 60,
    //             lastModification: new Date('2024-01-20 18:43:27'),
    //             isHidden: false,
    //         },
    //     ];

    //     this.logger.log('THIS ADDS DATA TO THE DATABASE, DO NOT USE OTHERWISE');
    //     await this.model.insertMany(quizzes);
    // }

    async getQuizzes(visibleOnly?: boolean): Promise<Quiz[]> {
        if (!visibleOnly) {
            return await this.model.find({}).sort({ lastModification: 1 });
        }

        return await this.model.find({ isHidden: false }).sort({ lastModified: 1 });
    }

    async getQuizById(id: string, visibleOnly?: boolean): Promise<Quiz> {
        if (!visibleOnly) {
            return await this.model.findOne({ _id: id });
        }

        return await this.model.findOne({ _id: id, isHidden: false });
    }

    async addQuiz(dto: QuizDto): Promise<Quiz> {
        dto.lastModification = new Date();
        dto.isHidden = true;
        // eslint-disable-next-line no-underscore-dangle
        delete dto._id;

        try {
            return await this.model.create(dto);
        } catch (error) {
            return Promise.reject('Failed to insert Quiz');
        }
    }

    async modifyQuiz(dto: QuizDto): Promise<Quiz> {
        dto.lastModification = new Date();

        try {
            // eslint-disable-next-line no-underscore-dangle
            return await this.model.findOneAndReplace({ _id: dto._id }, dto, { new: true });
        } catch (error) {
            return Promise.reject('Failed to modify quiz');
        }
    }

    async hideQuizById(id: string): Promise<Quiz> {
        try {
            const existingQuiz = await this.model.findOne({ _id: id });

            if (existingQuiz === null) {
                return Promise.reject(`Can't find quiz with ID ${id}`);
            } else {
                existingQuiz.lastModification = new Date();
                const updatedQuiz = await this.model.findOneAndUpdate(
                    { _id: id },
                    { $set: { isHidden: !existingQuiz.isHidden, lastModification: existingQuiz.lastModification } },
                    { new: true },
                );
                return updatedQuiz;
            }
        } catch (error) {
            return Promise.reject('Failed to toggle quiz hidden state');
        }
    }

    async deleteQuizById(id: string): Promise<void> {
        try {
            await this.model.findByIdAndDelete({ _id: id });
        } catch (error) {
            return Promise.reject('Failed to delete quiz');
        }
    }

    // async modifyQuestionInQuiz(id: string, questionId: string): Promise<Question> {
    //     try {
    //         return await this.model.findOneAndUpdate({ _id: id }, { $set: { questions: { _id: questionId } } }, { new: true });
    //     } catch (error) {
    //         return Promise.reject(`Failed to modify question: ${error}`);
    //     }
    // }

    // async deleteQuestionInQuizbyId(id: string, questionId: string): Promise<void> {
    //     try {
    //         await this.model.findOneAndUpdate({ _id: id }, { $pull: { questions: { _id: questionId } } });
    //     } catch (error) {
    //         return Promise.reject(`Failed to delete question: ${error}`);
    //     }
    // }
}
