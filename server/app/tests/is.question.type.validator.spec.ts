/* eslint-disable max-classes-per-file */
import { IsQuestionType } from '@app/validators/is-question-type.validator';
import { validate } from 'class-validator';

describe('IsQuestionTypeConstraint', () => {
    it('should validate a valid question type', async () => {
        class TestClass {
            @IsQuestionType()
            questionType: string;

            constructor(questionType: string) {
                this.questionType = questionType;
            }
        }

        const validInstance = new TestClass('QCM');
        const invalidInstance = new TestClass('InvalidType');

        const validErrors = await validate(validInstance);
        const invalidErrors = await validate(invalidInstance);

        expect(validErrors.length).toBe(0);
        expect(invalidErrors.length).toBeGreaterThan(0);
        expect(invalidErrors[0].constraints).toHaveProperty('arrayNotContainEmpty', 'questionType must not contain empty values');
    });

    it('should handle non-string values', async () => {
        const TEST_CLASS_VALUE = 123;
        class TestClass {
            @IsQuestionType()
            questionType: number; // Non-string type

            constructor(questionType: number) {
                this.questionType = questionType;
            }
        }

        const instance = new TestClass(TEST_CLASS_VALUE);
        const errors = await validate(instance);

        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints).toHaveProperty('arrayNotContainEmpty', 'questionType must not contain empty values');
    });
});
