import { ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, registerDecorator } from 'class-validator';

const TEN = 10;

@ValidatorConstraint({ name: 'isMultipleOfTen', async: false })
class IsMultipleOfTenConstraint implements ValidatorConstraintInterface {
    // eslint-disable-next-line no-unused-vars
    validate(value: unknown, _: ValidationArguments) {
        return typeof value === 'number' && value % TEN === 0;
    }

    defaultMessage(args: ValidationArguments) {
        return `${args.property} must be a multiple of ${TEN}`;
    }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const IsMultipleOfTen = (validationOptions?: ValidationOptions) => {
    return (object: object, propertyName: string) => {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsMultipleOfTenConstraint,
        });
    };
};
