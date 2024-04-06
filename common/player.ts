import { PlayerState } from './player-state';

export interface Player {
    socketId: string;
    username: string;
    state: PlayerState;
    score: number;
    speedAwardCount: number;
    isMuted: boolean;
    isTyping: boolean;
    hasInteracted: boolean;
    hasSubmitted: boolean;
}
