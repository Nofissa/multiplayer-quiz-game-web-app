import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-confirmation-dialog',
    templateUrl: './confirmation-dialog.component.html',
    styleUrls: ['./confirmation-dialog.component.scss'],
})
export class ConfirmationDialogComponent {
    constructor(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        @Inject(MAT_DIALOG_DATA) readonly data: any,
        private readonly dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    ) {}

    cancel(): void {
        this.dialogRef.close(false);
    }

    submit(): void {
        this.dialogRef.close(true);
    }
}
