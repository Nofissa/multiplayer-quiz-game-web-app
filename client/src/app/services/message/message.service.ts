import { Injectable } from '@angular/core';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { Chatlog } from '@common/chatlog';
import { Subscription } from 'rxjs';
import { applyIfPinMatches } from '@app/utils/conditional-applications/conditional-applications';

@Injectable({ providedIn: 'root' })
export class MessageService {
    private gameChatlogsMap: Map<string, Chatlog[]> = new Map();

    constructor(private readonly webSocketService: WebSocketService) {}

    sendMessage(pin: string, message: string) {
        this.webSocketService.emit('sendMessage', { pin, message });
    }

    onSendMessage(pin: string, callback: (chatlog: Chatlog) => void): Subscription {
        return this.webSocketService.on('sendMessage', applyIfPinMatches(pin, callback));
    }

    getGameChatlogs(pin: string): Chatlog[] {
        return this.gameChatlogsMap.get(pin) || [];
    }
}
