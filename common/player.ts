import { PlayerState } from './player-state';

export interface Player {
    username: string;
    state: PlayerState;
    score: number;
    speedAwardCount: number;
}
