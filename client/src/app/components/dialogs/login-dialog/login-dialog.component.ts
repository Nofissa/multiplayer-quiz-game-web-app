import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LoginDialogData } from '@app/interfaces/login-dialog-data';

@Component({
    selector: 'app-login-dialog',
    templateUrl: './login-dialog.component.html',
    styleUrls: ['./login-dialog.component.scss'],
})
export class LoginDialogComponent {
    formGroup: FormGroup;

    constructor(
        @Inject(MAT_DIALOG_DATA) readonly data: LoginDialogData,
        private readonly formBuilder: FormBuilder,
        private readonly dialogRef: MatDialogRef<LoginDialogComponent>,
    ) {
        this.formGroup = this.formBuilder.group({
            password: [this.data.password, Validators.required],
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
}
