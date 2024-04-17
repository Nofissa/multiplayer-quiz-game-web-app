import { Player } from '@common/player';
import { PlayerState } from '@common/player-state';

export const firstPlayerStub = (): Player => {
    return {
        socketId: '1234',
        username: 'Joe',
        state: PlayerState.Playing,
        score: 20,
        speedAwardCount: 12,
        isMuted: false,
        isTyping: false,
        hasInteracted: false,
        hasSubmitted: false,
    };
};

export const secondPlayerStub = (): Player => {
    return {
        socketId: '4632',
        username: 'Bob',
        state: PlayerState.Abandonned,
        score: 20,
        speedAwardCount: 12,
        isMuted: false,
        isTyping: false,
        hasInteracted: false,
        hasSubmitted: false,
    };
};
