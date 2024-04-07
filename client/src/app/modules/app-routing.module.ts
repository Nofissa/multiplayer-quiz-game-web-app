import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminPageComponent } from '@app/pages/admin-page/admin-page.component';
import { CreateGamePageComponent } from '@app/pages/create-game-page/create-game-page.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { HostGamePageComponent } from '@app/pages/host-game-page/host-game-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { PlayerResultsPageComponent } from '@app/pages/player-results-page/player-results-page.component';
import { QCMCreationPageComponent } from '@app/pages/qcm-creation-page/qcm-creation-page.component';
import { WaitingRoomPageComponent } from '@app/pages/waiting-room-page/waiting-room-page.component';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: MainPageComponent },
    { path: 'admin', component: AdminPageComponent },
    { path: 'create-game', component: CreateGamePageComponent },
    { path: 'game', component: GamePageComponent },
    { path: 'qcm-creation', component: QCMCreationPageComponent },
    { path: 'waiting-room', component: WaitingRoomPageComponent },
    { path: 'host-game', component: HostGamePageComponent },
    { path: 'results', component: PlayerResultsPageComponent },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
