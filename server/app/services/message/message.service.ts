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
        const clientPlayer = game.clientPlayers.get(client.id);

        const author = client.id === game.organizer.id ? 'Organisateur' : clientPlayer.player.username;
        const chatlog = { message: message.substring(0, MAX_MESSAGE_LENGTH), author, date: new Date() };
        game.chatlogs.push(chatlog);

        return chatlog;
    }
}
