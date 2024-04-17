import { ChoiceDto } from '@app/model/dto/choice/choice.dto';
import { ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, registerDecorator } from 'class-validator';

export
@ValidatorConstraint({ name: 'isValidChoices', async: false })
class IsValidChoicesConstraint implements ValidatorConstraintInterface {
    // _ could be used, optional parameter
    // eslint-disable-next-line no-unused-vars
    validate(choices: ChoiceDto[], _: ValidationArguments) {
        if (choices) {
            const hasTrue = choices.some((x) => x.isCorrect);
            const hasFalse = choices.some((x) => !x.isCorrect);

            return hasTrue && hasFalse;
        }

        return true;
    }
}

// works with this convention
// eslint-disable-next-line @typescript-eslint/naming-convention
export const IsValidChoices = (validationOptions?: ValidationOptions) => {
    return (object: object, propertyName: string) => {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsValidChoicesConstraint,
        });
    };
};
