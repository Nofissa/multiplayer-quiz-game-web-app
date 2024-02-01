import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from './confirmation-dialog.component';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

describe('ConfirmationDialogComponent', () => {
    let component: ConfirmationDialogComponent;
    let fixture: ComponentFixture<ConfirmationDialogComponent>;
    let dialogRefSpy: jasmine.SpyObj<MatDialogRef<ConfirmationDialogComponent>>;

    beforeEach(() => {
        const matDialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

        TestBed.configureTestingModule({
            declarations: [ConfirmationDialogComponent],
            providers: [
                { provide: MatDialogRef, useValue: matDialogRefSpy },
                { provide: MAT_DIALOG_DATA, useValue: {} },
            ],
        });

        fixture = TestBed.createComponent(ConfirmationDialogComponent);
        component = fixture.componentInstance;
        dialogRefSpy = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<ConfirmationDialogComponent>>;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call dialogRef.close with true when submit is pressed', () => {
        component.submit();

        expect(dialogRefSpy.close).toHaveBeenCalledWith(true);
    });

    it('should call dialogRef.close with false when cancel is pressed', () => {
        component.cancel();

        expect(dialogRefSpy.close).toHaveBeenCalledWith(false);
    });

    it('should close the dialog with true when the submit button is clicked', () => {
        const submitButton: DebugElement = fixture.debugElement.query(By.css('.button-submit'));

        submitButton.triggerEventHandler('click', null);

        expect(dialogRefSpy.close).toHaveBeenCalledWith(true);
    });

    it('should close the dialog with false when the cancel button is clicked', () => {
        const cancelButton: DebugElement = fixture.debugElement.query(By.css('.button-cancel'));

        cancelButton.triggerEventHandler('click', null);

        expect(dialogRefSpy.close).toHaveBeenCalledWith(false);
    });
});
