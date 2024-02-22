import { GameEventManager } from '@app/classes/game-event-manager';
import { GameService } from '@app/services/game/game.service';
import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(3001, {
    cors: {
        origin: 'http://localhost:4200',
        methods: ['GET', 'POST'],
        transports: ['websocket', 'polling'],
        credentials: false,
    },
    allowEIO3: true,
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() socketServer: Server;

    constructor(
        private readonly gameService: GameService,
        private readonly gameEventManager: GameEventManager,
    ) {}

    @SubscribeMessage('events')
    handleMessage(@MessageBody() data: string, @ConnectedSocket() client: Socket): string {
        return data;
    }

    @SubscribeMessage('createGame')
    async handleCreation(@MessageBody() quizId: string, @ConnectedSocket() client: Socket): Promise<string> {
        try {
            const pin = await this.gameService.createGame(client, quizId, 'username');
            return pin;
        } catch (err) {
            return err;
        }
    }

    @SubscribeMessage('joinGame')
    handleJoin(@MessageBody() object: string, @ConnectedSocket() client: Socket): boolean {
        try {
            const stringObject = JSON.parse(object);
            const isJoined = this.gameService.joinGame(client, stringObject.pin, stringObject.username);
            return isJoined;
        } catch (err) {
            return err;
        }
    }

    @SubscribeMessage('abandonGame')
    handleAbandon(@MessageBody() object: string, @ConnectedSocket() client: Socket): boolean {
        try {
            const stringObject = JSON.parse(object);
            const isAbandoned = this.gameService.abandonGame(client, stringObject.pin);
            return isAbandoned;
        } catch (err) {
            return err;
        }
    }

    // Join Game Validators
    @SubscribeMessage('validPin')
    handlePinValidation(@MessageBody() object: string): boolean {
        const stringObject = JSON.parse(object);
        return this.gameService.validatePin(stringObject.pin);
    }

    @SubscribeMessage('validUsername')
    handleUsernameValidation(@MessageBody() object: string): boolean {
        const stringObject = JSON.parse(object);
        return this.gameService.validateUsername(stringObject.pin, stringObject.username);
    }

    handleConnection(socket: Socket) {
        this.gameEventManager.registerHandlers(socket);
    }

    handleDisconnect(socket: Socket) {
        this.gameService.disconnect(socket.id);
    }
}
