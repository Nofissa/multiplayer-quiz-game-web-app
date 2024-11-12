import { Game } from '@app/classes/game';
import { GameService } from '@app/services/game/game.service';
import { GameSnapshot } from '@common/game-snapshot';
import { Controller, Get, HttpStatus, Param, Res } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('Games')
@Controller('games')
export class GameController {
    constructor(private readonly gameService: GameService) {}

    @ApiOkResponse({
        description: 'Return a game snapshot',
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Get('/:pin/snapshot')
    async get(@Param('pin') pin: string, @Res() response: Response) {
        try {
            const game = this.gameService.getGame(pin);

            const snapshot = this.generateSnapshot(game);

            response.status(HttpStatus.OK).json(snapshot);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send('La partie est introuvable');
        }
    }

    private generateSnapshot(game: Game): GameSnapshot {
        const snapshot: GameSnapshot = {
            chatlogs: game.chatlogs,
            players: Array.from(game.clientPlayers.values()).map((x) => x.player),
            state: game.state,
            currentQuestionIndex: game.currentQuestionIndex,
            quiz: {
                // Disabled because it comes from mongodb
                // eslint-disable-next-line no-underscore-dangle
                _id: game.quiz._id,
                id: game.quiz.id,
                title: game.quiz.title,
                description: game.quiz.description,
                isHidden: game.quiz.isHidden,
                duration: game.quiz.duration,
                lastModification: game.quiz.lastModification,
                questions: game.quiz.questions.map((x) => {
                    return {
                        // Disabled because it comes from mongodb
                        // eslint-disable-next-line no-underscore-dangle
                        _id: x._id,
                        type: x.type,
                        text: x.text,
                        points: x.points,
                        choices: x.choices,
                        lastModification: x.lastModification,
                    };
                }),
            },
            questionQcmSubmissions: game.qcmSubmissions.map((x) => Array.from(x.values())),
            questionQrlSubmission: game.qrlSubmissions.map((x) => Array.from(x.values())),
            questionQrlEvaluation: game.qrlEvaluations.map((x) => Array.from(x.values())),
        };

        return snapshot;
    }
}
