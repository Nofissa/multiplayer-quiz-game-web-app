import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from '@app/pages/app/app.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { ConfirmationDialogComponent } from './components/dialogs/confirmation-dialog/confirmation-dialog.component';
import { UpsertQuestionDialogComponent } from './components/dialogs/upsert-question-dialog/upsert-question-dialog.component';
import { QuestionListComponent } from './components/question-list/question-list.component';
import { QuestionComponent } from './components/question/question.component';
import { ShareTestComponent } from './components/share-test/share-test.component';
import { AppRoutingModule } from './modules/app-routing.module';
import { AdminPageComponent } from './pages/admin-page/admin-page.component';
import { CreateGamePageComponent } from './pages/create-game-page/create-game-page.component';
import { QCMCreationPageComponent } from './pages/qcmcreation-page/qcmcreation-page.component';
import { TimerDialComponent } from './components/timer-dial/timer-dial.component';

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
        QCMCreationPageComponent,
        UpsertQuestionDialogComponent,
        QuestionListComponent,
        QuestionComponent,
        ConfirmationDialogComponent,
        ShareTestComponent,
        TimerDialComponent,
    ],
    imports: [
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        HttpClientModule,
        MatButtonModule,
        MatDialogModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        ReactiveFormsModule,
    ],

    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
