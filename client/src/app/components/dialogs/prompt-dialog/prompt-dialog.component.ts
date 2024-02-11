import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PromptDialogData } from '@app/interfaces/prompt-dialog-data';

@Component({
    selector: 'app-prompt-dialog',
    templateUrl: './prompt-dialog.component.html',
    styleUrls: ['./prompt-dialog.component.scss'],
})
export class PromptDialogComponent {
    formGroup: FormGroup;

    constructor(
        @Inject(MAT_DIALOG_DATA) readonly data: PromptDialogData,
        private readonly formBuilder: FormBuilder,
        private readonly dialogRef: MatDialogRef<PromptDialogComponent>,
    ) {
        this.formGroup = this.formBuilder.group({
            value: [this.data.value, Validators.required],
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
