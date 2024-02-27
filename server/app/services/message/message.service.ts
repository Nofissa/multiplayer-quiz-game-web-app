import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Chatlog } from '@common/chatlog';
import { GameService } from '@app/services/game/game.service';

@Injectable()
export class MessageService {
    constructor(private readonly gameService: GameService) {}

    sendMessage(client: Socket, pin: string, message: string): Chatlog {
        const game = this.gameService.getGame(pin);
        const clientPlayer = game.clientPlayers.get(client.id);
        const chatlog = { message, author: clientPlayer.player.username, date: new Date() };

        return chatlog;
    }
}
