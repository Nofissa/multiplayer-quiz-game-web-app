import { GameService } from '@app/services/game/game.service';
import { Chatlog } from '@common/chatlog';
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

const MAX_MESSAGE_LENGTH = 200;

@Injectable()
export class MessageService {
    constructor(private readonly gameService: GameService) {}

    sendMessage(client: Socket, pin: string, message: string): Chatlog {
        const game = this.gameService.getGame(pin);
        const organizerId = this.gameService.getOrganizerId(pin);

        const author = client.id === organizerId ? 'Organisateur' : game.clientPlayers.get(client.id)?.player.username || 'Unknown';

        return {
            message: message.substring(0, MAX_MESSAGE_LENGTH),
            author,
            date: new Date(),
        };
    }
}
