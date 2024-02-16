import { GameEventManager } from '@app/classes/game-event-handler';
import { GameService } from '@app/services/game/game.service';
import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() socketServer: Server;

    constructor(
        private readonly gameService: GameService,
        private readonly gameEventManager: GameEventManager,
    ) {}

    handleConnection(socket: Socket) {
        this.gameEventManager.registerHandlers(socket);
    }

    handleDisconnect(socket: Socket) {
        this.gameService.disconnect(socket.id);
    }
}
