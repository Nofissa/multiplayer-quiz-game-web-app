import { Injectable } from '@angular/core';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { Chatlog } from '@common/chatlog';
import { Subscription } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MessageService {
    private gameChatlogsMap: Map<string, Chatlog[]> = new Map();

    constructor(private readonly webSocketService: WebSocketService) {}

    sendMessage(pin: string, message: string) {
        this.webSocketService.emit('sendMessage', { pin, message });
    }

    onSendMessage(pin: string, callback: (chatlog: Chatlog) => void): Subscription {
        const callbackWrapper = (chatlog: Chatlog) => {
            if (!this.gameChatlogsMap.has(pin)) {
                this.gameChatlogsMap.set(pin, []);
            }

            this.gameChatlogsMap.get(pin)?.push(chatlog);
            callback(chatlog);
        };

        return this.webSocketService.on('sendMessage', callbackWrapper);
    }

    getGameChatlogs(pin: string): Chatlog[] {
        return this.gameChatlogsMap.get(pin) || [];
    }
}
