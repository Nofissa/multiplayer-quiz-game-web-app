import { ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, registerDecorator } from 'class-validator';

@ValidatorConstraint({ name: 'arrayNotContainEmpty', async: false })
class ArrayNoEmptyValuesConstraint implements ValidatorConstraintInterface {
    // eslint-disable-next-line no-unused-vars
    validate(value: unknown[], _: ValidationArguments) {
        return (
            Array.isArray(value) &&
            value.every((item) => {
                return (typeof item === 'string' && item.trim().length > 0) || item;
            })
        );
    }

    defaultMessage(args: ValidationArguments) {
        return `${args.property} must not contain empty values`;
    }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const ArrayNoEmptyValues = (validationOptions?: ValidationOptions) => {
    return (object: object, propertyName: string) => {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [],
            validator: ArrayNoEmptyValuesConstraint,
        });
    };
};
