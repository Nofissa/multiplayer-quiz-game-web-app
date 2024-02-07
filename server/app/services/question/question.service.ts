/* eslint-disable no-underscore-dangle */
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Question, QuestionDocument } from '@app/model/database/question';
import { QuestionDto } from '@app/model/dto/question/question.dto';

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
        const questions: QuestionDto[] = [
            {
                text: 'Quelle est la valeur de la constante R dans la formule pV = nRT',
                type: 'QCM',
                choices: [
                    { text: '3.14 V/m^2', isCorrect: false },
                    { text: '2.72 C/s', isCorrect: false },
                    { text: '6.022x10^23 mol/N', isCorrect: false },
                    { text: '8.31 J/mol/K', isCorrect: true },
                ],
                points: 100,
                lastModification: new Date(),
            },
            {
                text: "En quelle année la compagnie d'automobile Volkswagen a-t-elle été fondée?",
                type: 'QCM',
                choices: [
                    { text: '1928', isCorrect: false },
                    { text: '1987', isCorrect: false },
                    { text: '1947', isCorrect: false },
                    { text: '1937', isCorrect: true },
                ],
                points: 30,
                lastModification: new Date('2024-01-20 18:43:27'),
            },
        ];

        this.logger.log('THIS ADDS DATA TO THE DATABASE, DO NOT USE OTHERWISE');
        await this.model.insertMany(questions);
    }

    async getAllQuestions(): Promise<Question[]> {
        return await this.model.find({}).sort({ lastModified: -1 });
    }

    async addQuestion(dto: QuestionDto): Promise<Question> {
        if (!(await this.validateQuestion(dto))) {
            return Promise.reject('Invalid question');
        }

        dto.lastModification = new Date();

        try {
            return await this.model.create(dto);
        } catch (error) {
            return Promise.reject(`Failed to insert question: ${error}`);
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
            return Promise.reject(`Failed to update question: ${error}`);
        }
    }

    async deleteQuestionById(id: string): Promise<void> {
        try {
            await this.model.findByIdAndDelete(id);
        } catch (error) {
            return Promise.reject(`Failed to delete question: ${error}`);
        }
    }

    async validateQuestion(dto: QuestionDto): Promise<boolean> {
        const regex = new RegExp(`^${dto.text}$`, 'i'); // for case unsensitive search
        const question = await this.model.findOne({ text: { $regex: regex } });

        return question._id !== dto._id && question === null;
    }
}
