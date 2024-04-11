import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { JoinGameDialogComponent } from './join-game-dialog.component';

describe('JoinGameDialogComponent', () => {
    let component: JoinGameDialogComponent;
    let fixture: ComponentFixture<JoinGameDialogComponent>;
    let dialogRefSpy: jasmine.SpyObj<MatDialogRef<JoinGameDialogComponent>>;

    beforeEach(async () => {
        const dialogRefMock = jasmine.createSpyObj('MatDialogRef', ['close']);

        await TestBed.configureTestingModule({
            declarations: [JoinGameDialogComponent],
            imports: [ReactiveFormsModule],
            providers: [{ provide: MatDialogRef, useValue: dialogRefMock }],
        }).compileComponents();

        dialogRefSpy = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<JoinGameDialogComponent>>;
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(JoinGameDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have required validators for pin and username', () => {
        const pinControl = component.formGroup.get('pin');
        const usernameControl = component.formGroup.get('username');

        expect(pinControl?.errors?.required).toBeTruthy();
        expect(usernameControl?.errors?.required).toBeTruthy();
    });

    it('should validate pin with custom validator', () => {
        const pinControl = component.formGroup.get('pin');

        pinControl?.setValue('1234');
        expect(pinControl?.valid).toBeTrue();

        pinControl?.setValue('123');
        expect(pinControl?.errors?.okPinLength).toBeTruthy();

        pinControl?.setValue('12a4');
        expect(pinControl?.errors?.okPinLength).toBeTruthy();
    });

    it('should close dialog when cancel is called', () => {
        component.cancel();
        expect(dialogRefSpy.close).toHaveBeenCalled();
    });

    it('should close dialog and emit form value when submit is called with valid form', () => {
        component.formGroup.patchValue({ pin: '1234', username: 'testUser' });
        component.submit();
        expect(dialogRefSpy.close).toHaveBeenCalledWith({ pin: '1234', username: 'testUser' });
    });

    it('should not close dialog when submit is called with invalid form', () => {
        component.submit();
        expect(dialogRefSpy.close).not.toHaveBeenCalled();
    });
});
