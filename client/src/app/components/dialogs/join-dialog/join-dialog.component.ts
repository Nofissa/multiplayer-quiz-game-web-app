import { Component, OnDestroy } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Socket, io } from 'socket.io-client';

const PIN_LENGTH = 4;

@Component({
    selector: 'app-join-dialog',
    templateUrl: './join-dialog.component.html',
    styleUrls: ['./join-dialog.component.scss'],
})
export class JoinDialogComponent implements OnDestroy {
    formGroup: FormGroup;
    private pin: string = '';
    private username: string = '';
    private socket: Socket = io('http://localhost:3001');

    constructor(
        private readonly formBuilder: FormBuilder,
        private readonly dialogRef: MatDialogRef<JoinDialogComponent>,
    ) {
        this.formGroup = this.formBuilder.group({
            pin: [this.pin, [Validators.required], [this.validatePin()]],
            username: [this.username, [Validators.required], [this.validateUsername()]],
        });
    }

    ngOnDestroy(): void {
        if (this.socket) {
            this.socket.disconnect();
        }
    }

    cancel() {
        this.dialogRef.close();
    }

    submit() {
        if (this.formGroup.valid) {
            this.dialogRef.close(this.formGroup.value);
        }
    }

    private validatePin(): AsyncValidatorFn {
        return async (control: AbstractControl): Promise<ValidationErrors | null> => {
            return new Promise(async (resolve) => {
                const isValid = await this.validatePinOnServer(control.value);
                if (PIN_LENGTH === control.value.length && isValid) {
                    resolve(null);
                } else {
                    resolve({ invalidPin: true });
                }
            });
        };
    }

    private async validatePinOnServer(pin: string): Promise<boolean> {
        return new Promise((resolve) => {
            this.socket.emit('validPin', `{"pin": "${pin}"}`, (response: boolean) => {
                resolve(response);
            });
        });
    }

    private validateUsername(): AsyncValidatorFn {
        return async (control: AbstractControl): Promise<ValidationErrors | null> => {
            return new Promise(async (resolve) => {
                const isValid = await this.validateUsernameOnServer(control.value);
                return isValid ? resolve(null) : resolve({ usernameNotUnique: true });
            });
        };
    }

    private async validateUsernameOnServer(username: string): Promise<boolean> {
        return new Promise((resolve) => {
            this.socket.emit('validUsername', `{"pin": "${this.formGroup.controls.pin.value}", "username": "${username}"}`, (response: boolean) => {
                resolve(response);
            });
        });
    }
}
