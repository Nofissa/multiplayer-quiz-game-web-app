import { Chatlog } from "./chatlog";
import { Player } from "./player";

export interface JoinGamePayload {
    pin: string;
    players: Player[],
    chatlogs: Chatlog[],
}
