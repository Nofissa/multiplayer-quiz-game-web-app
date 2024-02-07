import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-confirmation-dialog',
    templateUrl: './confirmation-dialog.component.html',
    styleUrls: ['./confirmation-dialog.component.scss'],
})
export class ConfirmationDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        @Inject(MAT_DIALOG_DATA) public data: any,
    ) {}

    cancel(): void {
        this.dialogRef.close(false);
    }

    submit(): void {
        this.dialogRef.close(true);
    }
}
