import { CONSTANTS } from '@app/constants/constants';
import { GameService } from '@app/services/game/game.service';
import { Chatlog } from '@common/chatlog';
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class MessageService {
    constructor(private readonly gameService: GameService) {}

    sendMessage(client: Socket, pin: string, message: string): Chatlog {
        const game = this.gameService.getGame(pin);
        const clientPlayer = game.clientPlayers.get(client.id);

        if (clientPlayer?.player?.isMuted) {
            throw new Error('Vous ne pouvez pas écrire dans la zone de clavardage');
        }

        const author = client.id === game.organizer.id ? 'Organisateur' : clientPlayer.player.username;
        const chatlog = { message: message.substring(0, CONSTANTS.maxMessageLength), author, date: new Date() };
        game.chatlogs.push(chatlog);

        return chatlog;
    }
}
