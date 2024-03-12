import { Player } from '@common/player';
import { PlayerState } from '@common/player-state';

export const playerstub = (): Player => {
    return {
        username: 'playerTest',
        state: PlayerState.Playing,
        score: 0,
        speedAwardCount: 0,
    };
};
