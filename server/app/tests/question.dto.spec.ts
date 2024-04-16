import { QuestionDto } from '@app/model/dto/question/question.dto';
import { QuestionType } from '@common/question-type';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import 'reflect-metadata';

describe('QuestionDto', () => {
    it('should validate a valid QuestionDto instance', async () => {
        const type: QuestionType = QuestionType.QCM;
        const validDtoData = {
            type,
            text: 'Valid question text',
            points: 10,
            choices: [
                { text: 'Choice 1', isCorrect: false },
                { text: 'Choice 2', isCorrect: true },
            ],
        };

        const validDtoInstance = plainToClass(QuestionDto, validDtoData);

        const errors = await validate(validDtoInstance);

        expect(errors.length).toBe(0);
    });

    it('should handle an invalid QuestionDto instance', async () => {
        const emptyDtoData = {
            type: 'InvalidType',
            text: 123,
            points: 'ten',
            choices: [{ text: 'Choice 1', isCorrect: 'true' }],
            lastModification: 'Invalid date',
        };

        const invalidDtoInstance = plainToClass(QuestionDto, emptyDtoData);

        const errors = await validate(invalidDtoInstance);

        expect(errors.length).toBeGreaterThan(0);
        expect(errors.find((err) => err.property === 'type')).toBeDefined();
        expect(errors.find((err) => err.property === 'text')).toBeDefined();
        expect(errors.find((err) => err.property === 'points')).toBeDefined();
        expect(errors.find((err) => err.property === 'choices')).toBeDefined();
        expect(errors.find((err) => err.property === 'lastModification')).toBeDefined();
    });
});
