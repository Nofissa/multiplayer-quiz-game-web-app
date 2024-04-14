import { ClientPlayer } from '@app/classes/client-player';
import { GameService } from '@app/services/game/game.service';
import { PlayerState } from '@common/player-state';
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class PlayerService {
    constructor(private readonly gameService: GameService) {}

    playerAbandon(client: Socket, pin: string): ClientPlayer | null {
        const game = this.gameService.getGame(pin);
        const clientPlayer = game.clientPlayers.get(client.id) || null;

        if (clientPlayer) {
            clientPlayer.player.state = PlayerState.Abandonned;
        }

        return clientPlayer;
    }

    playerBan(client: Socket, pin: string, username: string): ClientPlayer | null {
        const game = this.gameService.getGame(pin);

        if (!this.gameService.isOrganizer(game, client.id)) {
            throw new Error(`Vous n'êtes pas organisateur de la partie ${pin}`);
        }

        const clientPlayer =
            Array.from(game.clientPlayers.values()).find((x) => {
                return x.player.username.toLowerCase() === username.toLowerCase() && x.player.state === PlayerState.Playing;
            }) || null;

        if (clientPlayer) {
            clientPlayer.player.state = PlayerState.Banned;
        }

        return clientPlayer;
    }

    playerMute(client: Socket, pin: string, username: string): ClientPlayer {
        const game = this.gameService.getGame(pin);

        if (!this.gameService.isOrganizer(game, client.id)) {
            throw new Error(`Vous n'êtes pas organisateur de la partie ${pin}`);
        }

        const clientPlayer = Array.from(game.clientPlayers.values()).find((x) => {
            return x.player.username.trim().toLowerCase() === username.trim().toLowerCase() && x.player.state === PlayerState.Playing;
        });

        if (clientPlayer) {
            clientPlayer.player.isMuted = !clientPlayer.player.isMuted;
        }

        return clientPlayer;
    }

    disconnect(client: Socket): string[] {
        const games = Array.from(this.gameService.games.values());
        return games.filter((game) => Array.from(game.clientPlayers.values()).some((x) => x.socket.id === client.id)).map((game) => game.pin);
    }
}
