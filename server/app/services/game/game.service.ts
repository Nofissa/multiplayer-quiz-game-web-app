import { Injectable } from '@nestjs/common';
import { Choice, Question } from '@app/model/database/question';
import { ChoiceDto } from '@app/model/dto/choice/choice.dto';

const BONUS = 1.2;

@Injectable()
export class GameService {
    evaluateChoices(dtos: ChoiceDto[], question: Question): number {
        const correctChoices: Choice[] = question.choices.filter((x) => x.isCorrect);

        const outterIntersection = dtos.filter((x) => !correctChoices.includes(x));

        if (!outterIntersection) {
            return question.points * BONUS;
        } else {
            return 0;
        }
    }
}
