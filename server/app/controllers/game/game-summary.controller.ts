import { GameSummary } from '@app/model/database/game-summary';
import { GameSummaryService } from '@app/services/game/game-summary.service';
import { Controller, Delete, Get, HttpStatus, Query, Res } from '@nestjs/common';
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
    async getGameSummaries(
        @Res() response: Response,
        @Query('sortField') sortField: string,
        @Query('orderDirection') orderDirection: 'asc' | 'desc',
    ) {
        try {
            const field = sortField || 'defaultSortField';
            const order = orderDirection || 'asc';
            const gameSummaries = await this.gameSummaryService.getGameSummariesSorted(field, order);
            response.status(HttpStatus.OK).json(gameSummaries);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send('Game summaries not found');
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
