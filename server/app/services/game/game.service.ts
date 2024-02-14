import { Choice, Question } from '@app/model/database/question';
import { ChoiceDto } from '@app/model/dto/choice/choice.dto';
import { EvaluationPayload } from '@common/evaluation-payload';
import { Injectable } from '@nestjs/common';

const BONUS = 1.2;
const NO_BONUS = 0;

@Injectable()
export class GameService {
    evaluateChoices(chosenAnswers: ChoiceDto[], question: Question): EvaluationPayload {
        const correctAnswers: Choice[] = question.choices.filter((x) => x.isCorrect);
        const correctAnswerTexts: Set<string> = new Set(correctAnswers.map((x) => x.text));
        const chosenAnswerTexts: Set<string> = new Set(chosenAnswers.map((x) => x.text));

        const areEqualSets = correctAnswerTexts.size === chosenAnswerTexts.size && [...correctAnswerTexts].every((x) => chosenAnswerTexts.has(x));

        if (areEqualSets) {
            return { correctAnswers, score: question.points * BONUS };
        } else {
            return { correctAnswers, score: NO_BONUS };
        }
    }
}
