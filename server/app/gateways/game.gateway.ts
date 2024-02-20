import { GameEventManager } from '@app/classes/game-event-handler';
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
    async handleCreation(@MessageBody() data: string, @ConnectedSocket() client: Socket): Promise<string> {
        try {
            const pin = await this.gameService.createGame(client, data, 'username');
            return 'this sentence' + '   ' + pin.pin;
        } catch (err) {
            return err;
        }
    }

    @SubscribeMessage('joinGame')
    async handleJoin(@MessageBody() object: string, @ConnectedSocket() client: Socket): Promise<string> {
        try {
            const object1 = JSON.parse(object);
            const players = await this.gameService.joinGame(client, object1.pin, object1.username);
            return 'this sentence';
        } catch (err) {
            return err;
        }
    }

    @SubscribeMessage('validPin')
    handlePinValidation(@MessageBody() object: string): boolean {
        const object1 = JSON.parse(object);
        return this.gameService.validatePin(object1.pin) ? true : false;
    }

    @SubscribeMessage('validUsername')
    handleUsernameValidation(@MessageBody() object: string): boolean {
        const object1 = JSON.parse(object);
        return this.gameService.validateUsername(object1.pin, object1.username);
    }

    handleConnection(socket: Socket) {
        this.gameEventManager.registerHandlers(socket);
    }

    handleDisconnect(socket: Socket) {
        this.gameService.disconnect(socket.id);
    }
}
