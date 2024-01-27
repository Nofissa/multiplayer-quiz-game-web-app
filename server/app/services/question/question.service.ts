/* eslint-disable no-underscore-dangle */
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Question, QuestionDocument } from '@app/model/database/question';
import { UpsertQuestionDto } from '@app/model/dto/question/upsert-question.dto';

@Injectable()
export class QuestionService {
    constructor(
        @InjectModel(Question.name) public model: Model<QuestionDocument>,
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
                incorrectAnswers: ['3.14 V/m^2', '2.72 C/s', '6.022x10^23 mol/N'],
                correctAnswer: '8.31 J/mol/K',
                pointValue: 1,
                timeInSeconds: 10,
                lastModified: new Date(),
            },
            {
                question: "En quelle année la compagnie d'automobile Volkswagen a-t-elle été fondée?",
                incorrectAnswers: ['1928', '1987', '1947'],
                correctAnswer: '1937',
                pointValue: 1,
                timeInSeconds: 10,
                lastModified: new Date('2024-01-20 18:43:27'),
            },
        ];

        this.logger.log('THIS ADDS DATA TO THE DATABASE, DO NOT USE OTHERWISE');
        await this.model.insertMany(questions);
    }

    async getAllQuestions(): Promise<Question[]> {
        return await this.model.find({}).sort({ lastModified: -1 });
    }

    async addQuestion(dto: UpsertQuestionDto): Promise<Question> {
        if (!(await this.validateQuestion(dto))) {
            return Promise.reject('Invalid question');
        }

        dto.lastModified = new Date();

        try {
            return await this.model.create(dto);
        } catch (error) {
            return Promise.reject(`Failed to insert question: ${error}`);
        }
    }

    async updateQuestion(dto: UpsertQuestionDto): Promise<Question> {
        if (!(await this.validateQuestion(dto))) {
            return Promise.reject('Invalid question');
        }

        dto.lastModified = new Date();

        try {
            return await this.model.findOneAndReplace({ _id: dto._id }, dto, { new: true });
        } catch (error) {
            return Promise.reject(`Failed to update question: ${error}`);
        }
    }

    async deleteQuestionById(id: string): Promise<Question> {
        try {
            return await this.model.findByIdAndDelete(id, { new: true });
        } catch (error) {
            return Promise.reject(`Failed to delete question: ${error}`);
        }
    }

    async validateQuestion(dto: UpsertQuestionDto): Promise<boolean> {
        const regex = new RegExp(`^${dto.question}$`, 'i'); // for case unsensitive search
        const question = await this.model.findOne({ _id: { $ne: dto._id }, question: { $regex: regex } });

        return question === null;
    }
}
