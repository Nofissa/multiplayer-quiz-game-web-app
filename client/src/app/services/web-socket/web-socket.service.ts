import { Injectable } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { Observable, Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from 'src/environments/environment';

const ERROR_NOTICE_DURATION_MS = 5000;

@Injectable({ providedIn: 'root' })
export class WebSocketService {
    private socketInstance: Socket;

    constructor(private readonly snackBarService: MatSnackBar) {
        this.socketInstance = io(environment.serverUrl);

        this.socketInstance.on('error', (error) => {
            this.snackBarService.open(error, '', {
                duration: ERROR_NOTICE_DURATION_MS,
                verticalPosition: 'top',
                panelClass: ['error-snackbar'],
            });
        });
    }

    emit<T extends object>(eventName: string, data: T) {
        this.socketInstance.emit(eventName, data);
    }

    on<T>(eventName: string, callback: (data: T) => void): Subscription {
        return new Observable<T>((observer) => {
            this.socketInstance.on(eventName, (data: T) => {
                observer.next(data);
            });

            return () => {
                this.socketInstance.off(eventName);
            };
        }).subscribe(callback);
    }
}
