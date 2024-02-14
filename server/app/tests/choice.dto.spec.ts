import { ChoiceDto } from '@app/model/dto/choice/choice.dto';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

describe('ChoiceDto', () => {
    it('should validate a valid ChoiceDto instance', async () => {
        const validDtoData = {
            text: 'Valid choice',
            isCorrect: true,
        };

        const validDtoInstance = plainToClass(ChoiceDto, validDtoData);

        const errors = await validate(validDtoInstance);

        expect(errors.length).toBe(0);
    });

    it('should handle an invalid ChoiceDto instance', async () => {
        const invalidDtoData = {
            text: 123, // Invalid type for 'text'
            isCorrect: 'true', // Invalid type for 'isCorrect'
        };

        const invalidDtoInstance = plainToClass(ChoiceDto, invalidDtoData);

        const errors = await validate(invalidDtoInstance);

        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints).toHaveProperty('isString', 'text must be a string');
    });

    it('should handle missing isCorrect field as false', async () => {
        const dtoDataWithoutIsCorrect = {
            text: 'No isCorrect field',
        };

        const dtoInstanceWithoutIsCorrect = plainToClass(ChoiceDto, dtoDataWithoutIsCorrect);

        const errors = await validate(dtoInstanceWithoutIsCorrect);

        expect(errors.length).toBe(0);
        expect(dtoInstanceWithoutIsCorrect.isCorrect).toBe(false);
    });
});
