import { HttpClient, HttpHandler } from '@angular/common/http';
import { InjectionToken } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GameBoardComponent } from './game-board.component';

describe('GameBoardComponent', () => {
    let component: GameBoardComponent;
    let fixture: ComponentFixture<GameBoardComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [GameBoardComponent],
            providers: [HttpClient, HttpHandler, MatSnackBar, MatDialog, InjectionToken],
        });
        fixture = TestBed.createComponent(GameBoardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
