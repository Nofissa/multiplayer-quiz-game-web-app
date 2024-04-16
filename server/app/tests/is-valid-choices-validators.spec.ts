import { ChoiceDto } from '@app/model/dto/choice/choice.dto';
import { IsValidChoicesConstraint } from '@app/validators/is-valid-choices.validator';

describe('IsValidChoicesConstraint', () => {
    let constraint: IsValidChoicesConstraint;

    beforeEach(() => {
        constraint = new IsValidChoicesConstraint();
    });

    it('should return true for valid choices array', () => {
        const validChoices: ChoiceDto[] = [
            { isCorrect: true, text: 'Option A' },
            { isCorrect: false, text: 'Option B' },
            { isCorrect: false, text: 'Option C' },
        ];

        const result = constraint.validate(validChoices, undefined);

        expect(result).toBe(true);
    });

    it('should return false if all choices are correct or incorrect', () => {
        const allCorrectChoices: ChoiceDto[] = [
            { isCorrect: true, text: 'Option A' },
            { isCorrect: true, text: 'Option B' },
            { isCorrect: true, text: 'Option C' },
        ];

        const resultAllCorrect = constraint.validate(allCorrectChoices, undefined);
        expect(resultAllCorrect).toBe(false);

        const allIncorrectChoices: ChoiceDto[] = [
            { isCorrect: false, text: 'Option A' },
            { isCorrect: false, text: 'Option B' },
            { isCorrect: false, text: 'Option C' },
        ];

        const resultAllIncorrect = constraint.validate(allIncorrectChoices, undefined);
        expect(resultAllIncorrect).toBe(false);
    });

    it('should return true for undefined or empty choices array', () => {
        const resultUndefined = constraint.validate(undefined, undefined);
        expect(resultUndefined).toBe(true);

        const resultEmptyArray = constraint.validate(undefined, undefined);
        expect(resultEmptyArray).toBe(true);
    });
});
