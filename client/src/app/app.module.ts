import { CdkDrag, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from '@app/pages/app/app.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { SwiperModule } from 'swiper/angular';
import { LoaderAnimationComponent } from './components/animations/loader-animation/loader-animation.component';
import { ConfirmationDialogComponent } from './components/dialogs/confirmation-dialog/confirmation-dialog.component';
import { PromptDialogComponent } from './components/dialogs/prompt-dialog/prompt-dialog.component';
import { QuizDetailsDialogComponent } from './components/dialogs/quiz-details-dialog/quiz-details-dialog.component';
import { UpsertQuestionDialogComponent } from './components/dialogs/upsert-question-dialog/upsert-question-dialog.component';
import { GameComponent } from './components/game/game.component';
import { NavHeaderComponent } from './components/nav-header/nav-header.component';
import { QuestionBankComponent } from './components/question-bank/question-bank.component';
import { QuestionListComponent } from './components/question-list/question-list.component';
import { QuizListComponent } from './components/quiz-list/quiz-list.component';
import { QuizComponent } from './components/quiz/quiz.component';
import { TimerComponent } from './components/timer/timer.component';
import { AppRoutingModule } from './modules/app-routing.module';
import { AdminPageComponent } from './pages/admin-page/admin-page.component';
import { CreateGamePageComponent } from './pages/create-game-page/create-game-page.component';
import { QCMCreationPageComponent } from './pages/qcmcreation-page/qcmcreation-page.component';
import { WaitingRoomPageComponent } from './pages/waiting-room-page/waiting-room-page.component';
import { HostGamePageComponent } from './pages/host-game-page/host-game-page.component';
import { JoinGameDialogComponent } from './components/dialogs/join-game-dialog/join-game-dialog.component';

/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */
@NgModule({
    declarations: [
        AppComponent,
        AdminPageComponent,
        CreateGamePageComponent,
        GamePageComponent,
        MainPageComponent,
        QuizDetailsDialogComponent,
        QCMCreationPageComponent,
        UpsertQuestionDialogComponent,
        QuestionListComponent,
        ConfirmationDialogComponent,
        QuizListComponent,
        QuizComponent,
        QuestionListComponent,
        ConfirmationDialogComponent,
        QuestionBankComponent,
        QuestionBankComponent,
        GameComponent,
        WaitingRoomPageComponent,
        LoaderAnimationComponent,
        PromptDialogComponent,
        NavHeaderComponent,
        TimerComponent,
        HostGamePageComponent,
        JoinGameDialogComponent,
    ],
    imports: [
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        HttpClientModule,
        SwiperModule,
        MatDialogModule,
        MatExpansionModule,
        MatButtonModule,
        MatIconModule,
        MatSlideToggleModule,
        MatTabsModule,
        MatButtonModule,
        MatDialogModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatSnackBarModule,
        ReactiveFormsModule,
        CdkDropListGroup,
        CdkDrag,
        CdkDropList,
        MatSliderModule,
        MatSnackBarModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
