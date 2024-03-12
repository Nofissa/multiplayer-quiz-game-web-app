import { Chatlog } from "./chatlog";
import { Player } from "./player";

export interface GameInitBundle {
    players: Player[],
    chatlogs: Chatlog[],
}
