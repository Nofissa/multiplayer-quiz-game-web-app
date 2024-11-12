import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
    providedIn: 'root',
})
export class MaterialServicesProvider {
    constructor(
        private readonly dialogService: MatDialog,
        private readonly snackBarService: MatSnackBar,
    ) {}

    get dialog(): MatDialog {
        return this.dialogService;
    }

    get snackBar(): MatSnackBar {
        return this.snackBarService;
    }
}
