import { ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, registerDecorator } from 'class-validator';

@ValidatorConstraint({ name: 'isMultipleOfTen', async: false })
class IsMultipleOfConstraint implements ValidatorConstraintInterface {
    // _ could be used, optional parameter
    // eslint-disable-next-line no-unused-vars
    validate(value: unknown, args: ValidationArguments) {
        const multipleOf = args.constraints[0];

        return typeof value === 'number' && value % multipleOf === 0;
    }

    defaultMessage(args: ValidationArguments) {
        return `${args.property} must be a multiple of ${args.constraints[0]}`;
    }
}

// works with this convention
// eslint-disable-next-line @typescript-eslint/naming-convention
export const IsMultipleOf = (multipleOf: number, validationOptions?: ValidationOptions) => {
    return (object: object, propertyName: string) => {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [multipleOf],
            validator: IsMultipleOfConstraint,
        });
    };
};
