import { GameService } from '@app/services/game/game.service';
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class GameEventManager {
    constructor(private readonly gameService: GameService) {}

    // every socket event is defined by a name and the data that's passed to this event
    registerHandlers(socket: Socket) {
        // here, we declare an event named 'createGame' and deconstruct the data object into the properties we need
        socket.on('createGame', async ({ quizId, username }: { quizId: string; username: string }) => {
            await this.gameService.createGame(socket, quizId, username);
        });
        socket.on('joinGame', ({ pin, username }: { pin: string; username: string }) => {
            this.gameService.joinGame(socket, pin, username);
        });
    }
}
