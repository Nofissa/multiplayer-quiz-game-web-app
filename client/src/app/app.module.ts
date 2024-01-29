import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppComponent } from '@app/pages/app/app.component';
import { QuizListComponent } from './components/quiz-list/quiz-list.component';
import { QuizComponent } from './components/quiz/quiz.component';
import { AdminPageComponent } from './pages/admin-page/admin-page.component';
import { CreateGamePageComponent } from './pages/create-game-page/create-game-page.component';
import { GamePageComponent } from './pages/game-page/game-page.component';
import { MainPageComponent } from './pages/main-page/main-page.component';

/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */
@NgModule({
    declarations: [AppComponent, AdminPageComponent, CreateGamePageComponent, GamePageComponent, MainPageComponent, QuizListComponent, QuizComponent],
    imports: [
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        HttpClientModule,
        MatExpansionModule,
        MatButtonModule,
        MatIconModule,
        MatSlideToggleModule,
        MatTabsModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
