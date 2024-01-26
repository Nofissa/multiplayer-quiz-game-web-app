import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Quiz, QuizDocument } from '@app/model/database/quiz';
import { QuestionDto, UpsertQuizDto } from '@app/model/dto/quiz/upsert-quiz.dto';

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
        const questions: QuestionDto[] = [
            {
                question: 'Quelle est la valeur de la constante R dans la formule pV = nRT',
                incorrectAnswers: ['3.14 V/m^2', '2.72 C/s', '6.022x10^23 mol/N'],
                correctAnswer: '8.31 J/mol/K',
                lastModified: new Date(),
                pointValue: 1,
                timeInSeconds: 10,
            },
            {
                question: "En quelle année la compagnie d'automobile Volkswagen a-t-elle été fondée?",
                incorrectAnswers: ['1928', '1987', '1947'],
                correctAnswer: '1937',
                lastModified: new Date('2024-01-20 18:43:27'),
                pointValue: 1,
                timeInSeconds: 10,
            },
        ];

        const quizzes: Quiz[] = [
            {
                titre: 'Quiz 1',
                description : 'Quiz 1 description',
                questions: questions,
                lastModified: new Date(),
                isHidden: true,
            },
            {
                titre: 'Quiz 2',
                description : 'Quiz 2 description',
                questions: questions,
                lastModified: new Date('2024-01-20 18:43:27'),
                isHidden: false,
            }
        ];
        
        this.logger.log('THIS ADDS DATA TO THE DATABASE, DO NOT USE OTHERWISE');
        await this.model.insertMany(quizzes);
    }

    async getAllQuizzes(): Promise<Quiz[]> {
        return await this.model.find({}).sort({ lastModified: 1 });
    }

    async addQuiz(dto: UpsertQuizDto): Promise<void> {
        if ((await this.validateQuizInsertion(dto)) === false) {
            return Promise.reject('Invalid quiz');
        }

        dto.lastModified = new Date();

        try {
            await this.model.create(dto);
        } catch (error) {
            return Promise.reject(`Failed to insert course: ${error}`);
        }
    }
    //TODO : retourner modify quiz 
    async modifyQuiz(dto: UpsertQuizDto): Promise<void> {
        if ((await this.validateQuizInsertion(dto)) === false) {
            return Promise.reject('Invalid quiz');
        }

        dto.lastModified = new Date();

        try {
            await this.model.replaceOne(dto);
        } catch (error) {
            return Promise.reject(`Failed to insert quiz: ${error}`);
        }
    }
    //TODO : retourner deleted quiz 
    async deleteQuestionById(id: string): Promise<void> {
        try {
            await this.model.findByIdAndDelete(id);
        } catch (error) {
            return Promise.reject(`Failed to insert quiz: ${error}`);
        }
    }
    //TODO : valider les autre requis 
    async validateQuizInsertion(dto: UpsertQuizDto): Promise<boolean> {
        const regex = new RegExp(`^${dto.titre}$`, 'i'); // for case unsentiveness
        
        return await this.model.findOne({ titre: { $regex: regex } });
    }
}
