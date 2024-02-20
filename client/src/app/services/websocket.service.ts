import { Injectable } from '@angular/core';
import { Socket, io } from 'socket.io-client';

@Injectable({
    providedIn: 'root',
})
export class WebsocketService {
    constructor(private socket: Socket) {}

    connect(url: string) {
      console.log(url);
        this.socket = io();
        return this.socket;
    }

    sendMessage(message: string) {
        this.socket.emit('message', message);
    }

}
