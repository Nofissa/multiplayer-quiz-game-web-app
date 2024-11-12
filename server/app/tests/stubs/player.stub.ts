import { Player } from '@common/player';
import { PlayerState } from '@common/player-state';

export const playerstub = (): Player => {
    return {
        socketId: 'playerId',
        username: 'playerTest',
        state: PlayerState.Playing,
        score: 0,
        speedAwardCount: 0,
        hasSubmitted: false,
        hasInteracted: false,
        isTyping: false,
        isMuted: false,
    };
};
