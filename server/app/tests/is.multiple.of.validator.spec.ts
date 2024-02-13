/* eslint-disable max-classes-per-file */
import { IsMultipleOf } from '@app/validators/is-multiple-of.validator';
import { validate } from 'class-validator';

describe('IsMultipleOfConstraint', () => {
    const MULTIPLE_OF_TEN = 10;
    const VALID_VALUE = 20;
    const INVALID_VALUE = 15;
    it('should validate a number that is a multiple of 10', async () => {
        class TestClass {
            @IsMultipleOf(MULTIPLE_OF_TEN)
            value: number;

            constructor(value: number) {
                this.value = value;
            }
        }

        const validInstance = new TestClass(VALID_VALUE);
        const invalidInstance = new TestClass(INVALID_VALUE);

        const validErrors = await validate(validInstance);
        const invalidErrors = await validate(invalidInstance);

        expect(validErrors.length).toBe(0);
        expect(invalidErrors.length).toBeGreaterThan(0);
        expect(invalidErrors[0].constraints).toHaveProperty('isMultipleOfTen', 'value must be a multiple of 10');
    });

    it('should handle non-number values', async () => {
        class TestClass {
            @IsMultipleOf(MULTIPLE_OF_TEN)
            value: string;

            constructor(value: string) {
                this.value = value;
            }
        }

        const instance = new TestClass('not a number');
        const errors = await validate(instance);

        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints).toHaveProperty('isMultipleOfTen', 'value must be a multiple of 10');
    });
});
