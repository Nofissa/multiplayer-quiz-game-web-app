import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { PIN_LENGTH } from '@app/constants/constants';
import { UserService } from '@app/services/user/user-service';

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
        private userService: UserService,
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
            this.userService.setUsername(this.formGroup.value.username);
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
