import { ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, registerDecorator } from 'class-validator';

@ValidatorConstraint({ name: 'arrayNotContainEmpty', async: false })
class IsQuestionTypeConstraint implements ValidatorConstraintInterface {
    // eslint-disable-next-line no-unused-vars
    validate(value: unknown[], _: ValidationArguments) {
        return typeof value === 'string' && (value === 'QCM' || value === 'QRL');
    }

    defaultMessage(args: ValidationArguments) {
        return `${args.property} must not contain empty values`;
    }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const IsQuestionType = (validationOptions?: ValidationOptions) => {
    return (object: object, propertyName: string) => {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsQuestionTypeConstraint,
        });
    };
};
