import { Question } from '@app/model/database/question';
import { Quiz } from '@app/model/database/quiz';
import { ChoiceDto } from '@app/model/dto/choice/choice.dto';
import { GameService } from '@app/services/game/game.service';
import { QuizService } from '@app/services/quiz/quiz.service';
import { Body, Controller, HttpStatus, Param, Post, Query, Res } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('Game')
@Controller('game')
export class GameController {
    constructor(
        private readonly gameService: GameService,
        private readonly quizService: QuizService,
    ) {}

    @ApiOkResponse({
        description: 'Returns points for the choices',
    })
    @Post('/evaluateChoices/:quizId')
    async evaluateChoices(
        @Param('quizId') quizId: string,
        @Query('questionIndex') questionIndex: number,
        @Body() choices: ChoiceDto[],
        @Res() response: Response,
    ) {
        try {
            const quiz: Quiz = await this.quizService.getQuizById(quizId);
            const questions: Question[] = quiz.questions;

            if (questions.length <= questionIndex) {
                response.status(HttpStatus.BAD_REQUEST).send("Cette question n'existe pas");
            }

            const targetedQuestion = questions[questionIndex];
            const score = this.gameService.evaluateChoices(choices, targetedQuestion);

            response.status(HttpStatus.OK).send(score);
        } catch (error) {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(error.message);
        }
    }
}
