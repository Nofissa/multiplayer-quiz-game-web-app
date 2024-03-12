/* eslint-disable @typescript-eslint/no-explicit-any */
import { ClientPlayer } from '@app/classes/client-player';
import { playerstub } from './player.stub';

export const clientPlayerStub = (): ClientPlayer => {
    return {
        socket: { id: 'playerId' } as any,
        player: playerstub(),
    };
};
