import { Player } from "./player";

export interface JoinGamePayload {
    player: Player,
    isSelf: boolean,
}
