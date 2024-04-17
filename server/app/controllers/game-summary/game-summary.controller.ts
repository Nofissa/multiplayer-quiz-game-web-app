import { GameSummary } from '@app/model/database/game-summary';
import { GameSummaryService } from '@app/services/game-summary/game-summary.service';
import { Controller, Delete, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('GameSummary')
@Controller('gameSummaries')
export class GameSummaryController {
    constructor(private readonly gameSummaryService: GameSummaryService) {}

    @ApiOkResponse({
        description: 'Return all game summaries',
        type: GameSummary,
        isArray: true,
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Get('/')
    async getSummaries(@Res() response: Response) {
        try {
            const gameSummaries = await this.gameSummaryService.getGameSummaries();
            response.status(HttpStatus.OK).json(gameSummaries);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send('Summaries not found');
        }
    }
    @ApiOkResponse({
        description: 'Delete all game summaries',
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Delete('/deleteAll')
    async deleteAllGameSummaries(@Res() response: Response) {
        try {
            await this.gameSummaryService.deleteAllGameSummaries();
            response.status(HttpStatus.OK).send();
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send("Can't find game summaries to delete");
        }
    }
}
