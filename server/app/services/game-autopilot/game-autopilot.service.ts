import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Socket } from 'socket.io';
import { GameAutopilot } from '@app/classes/game-autopilot';

@Injectable()
export class GameAutopilotService {
    gameAutopilots: Map<string, GameAutopilot> = new Map();

    constructor(private readonly moduleRef: ModuleRef) {}

    runGame(client: Socket, pin: string) {
        const gameAutopilot = new GameAutopilot(this.moduleRef, client, pin);
        this.gameAutopilots.set(pin, gameAutopilot);

        gameAutopilot.run();
    }

    stopGame(pin: string) {
        this.gameAutopilots.get(pin)?.stop();
        this.gameAutopilots.delete(pin);
    }
}
