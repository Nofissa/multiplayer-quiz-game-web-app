import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PromptDialogComponent } from './prompt-dialog.component';

describe('PromptDialogComponent', () => {
    let component: PromptDialogComponent;
    let fixture: ComponentFixture<PromptDialogComponent>;
    let dialogRefSpy: jasmine.SpyObj<MatDialogRef<PromptDialogComponent>>;

    beforeEach(() => {
        const matDialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

        TestBed.configureTestingModule({
            declarations: [PromptDialogComponent],
            providers: [
                { provide: MatDialogRef, useValue: matDialogRefSpy },
                { provide: MAT_DIALOG_DATA, useValue: {} },
            ],
        });

        fixture = TestBed.createComponent(PromptDialogComponent);
        component = fixture.componentInstance;
        dialogRefSpy = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<PromptDialogComponent>>;
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize form with provided data', () => {
        expect(component.formGroup.value).toEqual({ value: null });
    });

    it('should close dialog when cancel is called', () => {
        component.cancel();
        expect(dialogRefSpy.close).toHaveBeenCalledWith();
    });

    it('should not close dialog when submit is called with invalid form', () => {
        component.submit();
        expect(dialogRefSpy.close).not.toHaveBeenCalled();
    });

    it('should close dialog with form value when submit is called', () => {
        component.formGroup.setValue({ value: 'new value' });
        component.submit();
        expect(dialogRefSpy.close).toHaveBeenCalledWith({ value: 'new value' });
    });
});
