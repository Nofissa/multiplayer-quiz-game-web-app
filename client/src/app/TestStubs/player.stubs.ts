import { PlayerState } from '@common/player-state';

export const firstPlayerStub = () => {
    return {
        socketId: '1234',
        username: 'Joe',
        state: PlayerState.Playing,
        score: 20,
        speedAwardCount: 12,
        isMuted: false,
        isSelected: false,
        isSubmitted: false,
    };
};

export const secondPlayerStub = () => {
    return {
        socketId: '4632',
        username: 'Bob',
        state: PlayerState.Abandonned,
        score: 20,
        speedAwardCount: 12,
        isMuted: true,
        isSelected: false,
        isSubmitted: false,
    };
};
