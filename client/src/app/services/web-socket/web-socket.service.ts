import { Injectable } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { Observable, Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class WebSocketService {
    private socketInstance: Socket;

    constructor() {
        this.socketInstance = io(environment.serverUrl);
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
