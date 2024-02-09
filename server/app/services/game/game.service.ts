import { Injectable } from '@nestjs/common';
import { Choice, Question } from '@app/model/database/question';
import { ChoiceDto } from '@app/model/dto/choice/choice.dto';
import { EvaluationPayload } from '@common/evaluation-payload';

const BONUS = 1.2;

@Injectable()
export class GameService {
    evaluateChoices(dtos: ChoiceDto[], question: Question): EvaluationPayload {
        const correctAnswers: Choice[] = question.choices.filter((x) => x.isCorrect);

        const complement = dtos.filter((x) => correctAnswers.includes(x));

        if (!complement.length) {
            return { correctAnswers, score: question.points * BONUS };
        } else {
            return { correctAnswers, score: 0 };
        }
    }
}
