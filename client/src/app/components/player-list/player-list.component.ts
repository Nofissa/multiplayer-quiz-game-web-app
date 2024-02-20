import { Component, OnInit } from '@angular/core';
import { Player } from '@app/interfaces/player';
import { PlayerHttpService } from '@app/services/player/player-http.service';

@Component({
    selector: 'app-player-list',
    templateUrl: './player-list.component.html',
    styleUrls: ['./player-list.component.scss'],
})
export class PlayerListComponent implements OnInit {
    players: Player[] = [];
    constructor(private readonly playerHttpService: PlayerHttpService) {}
    ngOnInit(): void {
        this.playerHttpService.getAllPlayers().subscribe((players) => {
            this.players = players;
        });
    }
}
