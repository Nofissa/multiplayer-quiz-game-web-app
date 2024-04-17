// for mongodb ids
/* eslint-disable no-underscore-dangle */
import { escapeRegExp } from '@app/helpers/regex';
import { Question, QuestionDocument } from '@app/model/database/question';
import { QuestionDto } from '@app/model/dto/question/question.dto';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class QuestionService {
    constructor(
        @InjectModel(Question.name) public model: Model<QuestionDocument>,
        private readonly logger: Logger,
    ) {}
    async getAllQuestions(): Promise<Question[]> {
        return await this.model.find({}).sort({ lastModification: -1 });
    }

    async addQuestion(dto: QuestionDto): Promise<Question> {
        if (!(await this.validateQuestion(dto))) {
            return Promise.reject('Invalid question');
        }
        delete dto._id;
        dto.lastModification = new Date();

        try {
            return await this.model.create(dto);
        } catch (error) {
            return Promise.reject('Failed to insert question');
        }
    }

    async updateQuestion(dto: QuestionDto): Promise<Question> {
        if (!(await this.validateQuestion(dto))) {
            return Promise.reject('Invalid question');
        }

        dto.lastModification = new Date();

        try {
            return await this.model.findOneAndReplace({ _id: dto._id }, dto, { new: true });
        } catch (error) {
            return Promise.reject('Failed to update question');
        }
    }

    async deleteQuestionById(id: string): Promise<void> {
        try {
            await this.model.findByIdAndDelete(id);
        } catch (error) {
            return Promise.reject('Failed to delete question');
        }
    }

    async validateQuestion(dto: QuestionDto): Promise<boolean> {
        const escapedText = escapeRegExp(dto.text);
        const regex = new RegExp(`^${escapedText}$`, 'i'); // for case unsensitive search
        const question = await this.model.findOne({ text: { $regex: regex } });

        return question === null ? true : question._id === dto._id;
    }
}
