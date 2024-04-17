import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NOTICE_DURATION_MS } from '@app/constants/constants';
import { Observable, Subscription } from 'rxjs';
import { Socket, io } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class WebSocketService {
    socketInstance: Socket;

    constructor(private readonly snackBarService: MatSnackBar) {
        this.socketInstance = io(environment.serverUrl);

        this.socketInstance.on('error', (error) => {
            this.snackBarService.open(error, '', {
                duration: NOTICE_DURATION_MS,
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

    getSocketId(): string {
        return this.socketInstance.id;
    }
}
