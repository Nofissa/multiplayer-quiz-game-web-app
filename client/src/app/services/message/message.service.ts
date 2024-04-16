import { Injectable } from '@angular/core';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { applyIfPinMatches } from '@app/utils/conditional-applications/conditional-applications';
import { Chatlog } from '@common/chatlog';
import { MessageEvent } from '@common/message-event';
import { Subscription } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MessageService {
    private gameChatlogsMap: Map<string, Chatlog[]> = new Map();

    constructor(private readonly webSocketService: WebSocketService) {}

    sendMessage(pin: string, message: string) {
        this.webSocketService.emit(MessageEvent.SendMessage, { pin, message });
    }

    onSendMessage(pin: string, callback: (chatlog: Chatlog) => void): Subscription {
        return this.webSocketService.on(MessageEvent.SendMessage, applyIfPinMatches(pin, callback));
    }

    getGameChatlogs(pin: string): Chatlog[] {
        return this.gameChatlogsMap.get(pin) || [];
    }
}
