import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { Chatlog } from '@common/chatlog';

@Injectable({ providedIn: 'root' })
export class MessageService {
    constructor(private readonly webSocketService: WebSocketService) {}

    sendMessage(pin: string, message: string) {
        this.webSocketService.emit('sendMessage', { pin, message });
    }

    onSendMessage(callback: (chatlogs: Chatlog[]) => void): Subscription {
        return this.webSocketService.on('sendMessage', callback);
    }
}
