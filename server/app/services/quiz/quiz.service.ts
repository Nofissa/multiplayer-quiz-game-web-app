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
    ) {}

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
}
