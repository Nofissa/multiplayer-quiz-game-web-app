import { QuizDto } from '@app/model/dto/quiz/quiz.dto';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import 'reflect-metadata';

describe('QuizDto', () => {
    it('should validate a valid QuizDto instance', async () => {
        const validDtoData = {
            _id: 'validId',
            id: 'validId',
            title: 'Valid Quiz',
            description: 'This is a valid quiz.',
            duration: 30,
            lastModification: new Date(),
            questions: [
                {
                    _id: 'questionId1',
                    type: 'QCM',
                    text: 'Question 1',
                    points: 10,
                    choices: [
                        { text: 'Choice 1', isCorrect: true },
                        { text: 'Choice 2', isCorrect: false },
                    ],
                },
            ],
            isHidden: false,
        };

        const validDtoInstance = plainToClass(QuizDto, validDtoData);

        const errors = await validate(validDtoInstance);

        expect(errors.length).toBe(0);
    });

    it('should handle an invalid QuizDto instance', async () => {
        const invalidDtoData = {
            title: '',
            description: '',
            duration: 'invalidDuration',
            questions: [
                {
                    type: 'InvalidType',
                    text: 123,
                    points: 'invalidPoints',
                    choices: [{ text: 'Choice 1', isCorrect: 'true' }],
                },
            ],
            isHidden: 'notABoolean',
            lastModification: 'notADate',
        };

        const invalidDtoInstance = plainToClass(QuizDto, invalidDtoData);

        const errors = await validate(invalidDtoInstance);

        expect(errors.length).toBeGreaterThan(0);
        expect(errors.find((err) => err.property === 'title')).toBeDefined();
        expect(errors.find((err) => err.property === 'description')).toBeDefined();
        expect(errors.find((err) => err.property === 'duration')).toBeDefined();
        expect(errors.find((err) => err.property === 'isHidden')).toBeDefined();
        expect(errors.find((err) => err.property === 'lastModification')).toBeDefined();
    });
});
