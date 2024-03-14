import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

const PIN_LENGTH = 4;

@Component({
    selector: 'app-join-game-dialog',
    templateUrl: './join-game-dialog.component.html',
    styleUrls: ['./join-game-dialog.component.scss'],
})
export class JoinGameDialogComponent {
    formGroup: FormGroup;
    private pin: string = '';
    private username: string = '';

    constructor(
        private readonly formBuilder: FormBuilder,
        private readonly dialogRef: MatDialogRef<JoinGameDialogComponent>,
    ) {
        this.formGroup = this.formBuilder.group({
            pin: [this.pin, [Validators.required, this.pinValidator()]],
            username: [this.username, [Validators.required]],
        });
    }

    cancel() {
        this.dialogRef.close();
    }

    submit() {
        if (this.formGroup.valid) {
            this.dialogRef.close(this.formGroup.value);
        }
    }

    private pinValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const pin: string = control.value;
            const isValidPinLength = pin.length === PIN_LENGTH;
            const containsOnlyNumbers = /^\d+$/.test(pin);

            return isValidPinLength && containsOnlyNumbers ? null : { okPinLength: true };
        };
    }
}
