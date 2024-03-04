import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { Chatlog } from '@common/chatlog';
import { applyIfPinMatches } from '@app/utils/condition-applications/conditional-applications';

@Injectable({ providedIn: 'root' })
export class MessageService {
    constructor(private readonly webSocketService: WebSocketService) {}

    sendMessage(pin: string, message: string) {
        this.webSocketService.emit('sendMessage', { pin, message });
    }

    onSendMessage(pin: string, callback: (chatlog: Chatlog) => void): Subscription {
        return this.webSocketService.on('sendMessage', applyIfPinMatches(pin, callback));
    }
}
