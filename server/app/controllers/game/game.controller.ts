import { GameService } from '@app/services/game/game.service';
import { Controller, Get, HttpStatus, Param, Res } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { GameSnapshot } from '@common/game-snapshot';
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
            const snapshot: GameSnapshot = {
                chatlogs: game.chatlogs,
                players: Array.from(game.clientPlayers.values()).map((x) => x.player),
                currentQuestionIndex: game.currentQuestionIndex,
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
                questionSubmissions: game.questionSubmissions.map((x) => Array.from(x.values())),
            };

            response.status(HttpStatus.OK).json(snapshot);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send('Cannot find game');
        }
    }
}
