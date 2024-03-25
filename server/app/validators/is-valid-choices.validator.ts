import { ChoiceDto } from '@app/model/dto/choice/choice.dto';
import { ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, registerDecorator } from 'class-validator';

@ValidatorConstraint({ name: 'isValidChoices', async: false })
class IsValidChoicesConstraint implements ValidatorConstraintInterface {
    // _ could be used, optional parameter
    // eslint-disable-next-line no-unused-vars
    validate(choices: ChoiceDto[], _: ValidationArguments) {
        const hasTrue = choices.some((x) => x.isCorrect === true);
        const hasFalse = choices.some((x) => x.isCorrect === false);

        return hasTrue && hasFalse;
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
