import { GameHistory } from '@app/model/database/game-history';
import { GameHistoryService } from '@app/services/game/game-history.service';
import { Controller, Delete, Get, HttpStatus, Query, Res } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('GameHistory')
@Controller('gameHistories')
export class GameHistoryController {
    constructor(private readonly gameHistoryService: GameHistoryService) {}

    @ApiOkResponse({
        description: 'Return all game histories',
        type: GameHistory,
        isArray: true,
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Get('/')
    async getGameHistories(
        @Res() response: Response,
        @Query('sortField') sortField: string,
        @Query('orderDirection') orderDirection: 'asc' | 'desc',
    ) {
        try {
            const field = sortField || 'defaultSortField';
            const order = orderDirection || 'asc';
            const gameHistories = await this.gameHistoryService.getGameHistoriesSorted(field, order);
            response.status(HttpStatus.OK).json(gameHistories);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send('Game histories not found');
        }
    }

    @ApiOkResponse({
        description: 'Delete all game histories',
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Delete('/deleteAll')
    async deleteAllGameHistories(@Res() response: Response) {
        try {
            await this.gameHistoryService.deleteAllGameHistories();
            response.status(HttpStatus.OK).send();
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send("Can't find game histories to delete");
        }
    }
}
