import { ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, registerDecorator } from 'class-validator';

@ValidatorConstraint({ name: 'arrayNotContainEmpty', async: false })
class IsQuestionTypeConstraint implements ValidatorConstraintInterface {
    // _ could be used, optional parameter
    // eslint-disable-next-line no-unused-vars
    validate(value: unknown[], _: ValidationArguments) {
        return typeof value === 'string' && ((value as string).trim().toUpperCase() === 'QCM' || (value as string).trim().toUpperCase() === 'QRL');
    }

    defaultMessage(args: ValidationArguments) {
        return `${args.property} must not contain empty values`;
    }
}

// works with this convention
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
