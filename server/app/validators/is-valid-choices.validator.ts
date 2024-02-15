import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments, ValidationOptions, registerDecorator } from 'class-validator';
import { ChoiceDto } from '@app/model/dto/choice/choice.dto';

@ValidatorConstraint({ name: 'isValidChoices', async: false })
class IsValidChoicesConstraint implements ValidatorConstraintInterface {
    // eslint-disable-next-line no-unused-vars
    validate(choices: ChoiceDto[], _: ValidationArguments) {
        const hasTrue = choices.some((x) => x.isCorrect === true);
        const hasFalse = choices.some((x) => x.isCorrect === false);

        return hasTrue && hasFalse;
    }

    defaultMessage(args: ValidationArguments) {
        return args.constraints[0] || "Le champ 'choices' devrait contenir au moins une entrée valide et une autre entrée invalide";
    }
}

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
