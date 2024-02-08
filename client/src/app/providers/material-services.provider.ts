/* eslint-disable no-underscore-dangle */
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
    providedIn: 'root',
})
export class MaterialServicesProvider {
    constructor(
        private readonly _dialogService: MatDialog,
        private readonly _snackBarService: MatSnackBar,
    ) {}

    get dialogService(): MatDialog {
        return this._dialogService;
    }

    get snackBarService(): MatSnackBar {
        return this._snackBarService;
    }
}
