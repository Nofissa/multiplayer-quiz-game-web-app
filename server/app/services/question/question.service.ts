import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Question, QuestionDocument } from '@app/model/database/question';
import { CreateQuestionDto } from '@app/model/dto/question/create-question.dto';
import { UpdateQuestionDto } from '@app/model/dto/question/update-question.dto';

@Injectable()
export class QuizService {
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
        const questions: CreateQuestionDto[] = [
            {
                question: 'Quelle est la valeur de la constante R dans la formule pV = nRT',
                incorrectAnswers: ['3.14 V/m^2', '2.72 C/s', '6.022x10^23 mol/N'],
                correctAnswer: '8.31 J/mol/K',
                lastModified: new Date(),
            },
            {
                question: "En quelle année la compagnie d'automobile Volkswagen a-t-elle été fondée?",
                incorrectAnswers: ['1928', '1987', '1947'],
                correctAnswer: '1937',
                lastModified: new Date('2024-01-20 18:43:27'),
            },
        ];

        this.logger.log('THIS ADDS DATA TO THE DATABASE, DO NOT USE OTHERWISE');
        await this.model.insertMany(questions);
    }

    async getAllQuestions(): Promise<Question[]> {
        return await this.model.find({}).sort({ lastModified: 1 });
    }

    async addQuestion(dto: CreateQuestionDto): Promise<void> {
        if ((await this.validateQuestionInsertion(dto)) === false) {
            return Promise.reject('Invalid question');
        }

        dto.lastModified = new Date();

        try {
            await this.model.create(dto);
        } catch (error) {
            return Promise.reject(`Failed to insert course: ${error}`);
        }
    }

    async modifyQuestion(dto: UpdateQuestionDto): Promise<void> {
        if ((await this.validateQuestionInsertion(dto)) === false) {
            return Promise.reject('Invalid question');
        }

        dto.lastModified = new Date();

        try {
            await this.model.replaceOne(dto);
        } catch (error) {
            return Promise.reject(`Failed to insert course: ${error}`);
        }
    }

    async deleteQuestionById(id: string): Promise<void> {
        try {
            await this.model.findByIdAndDelete(id);
        } catch (error) {
            return Promise.reject(`Failed to insert course: ${error}`);
        }
    }

    async validateQuestionInsertion(dto: CreateQuestionDto): Promise<boolean> {
        const regex = new RegExp(`^${dto.question}$`, 'i'); // for case unsentiveness

        return await this.model.findOne({ question: { $regex: regex } });
    }
}
