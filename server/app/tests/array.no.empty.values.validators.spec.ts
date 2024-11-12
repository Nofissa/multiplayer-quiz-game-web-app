import { ArrayNoEmptyValues } from '@app/validators/array-no-empty-values.validator';
import { validate } from 'class-validator';

describe('ArrayNoEmptyValuesConstraint', () => {
    it('should validate arrays with no empty values', async () => {
        class TestClass {
            @ArrayNoEmptyValues()
            myArray: string[];

            constructor(myArray: string[]) {
                this.myArray = myArray;
            }
        }

        const validInstance = new TestClass(['a', 'b', 'c']);
        const invalidInstance = new TestClass(['a', '', 'c']);

        const validErrors = await validate(validInstance);
        const invalidErrors = await validate(invalidInstance);

        expect(validErrors.length).toBe(0);
        expect(invalidErrors.length).toBeGreaterThan(0);
        expect(invalidErrors[0].constraints).toHaveProperty('arrayNotContainEmpty', 'myArray must not contain empty values');
    });
});
