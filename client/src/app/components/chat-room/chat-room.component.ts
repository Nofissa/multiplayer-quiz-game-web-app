import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from '@app/services/message/message.service';
import { Chatlog } from '@common/chatlog';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-chat-room',
    templateUrl: './chat-room.component.html',
    styleUrls: ['./chat-room.component.scss'],
})
export class ChatRoomComponent implements OnInit, OnDestroy {
    chatMessage = '';
    chatlogsArray: Chatlog[] = [];
    private messageSubscription: Subscription;

    constructor(
        private messageService: MessageService,
        private readonly activatedRoute: ActivatedRoute,
    ) {}

    ngOnInit() {
        this.messageSubscription = this.messageService.onSendMessage((chatlog: Chatlog) => {
            this.chatlogsArray.push(chatlog);
        });
    }
    ngOnDestroy() {
        if (this.messageSubscription) {
            this.messageSubscription.unsubscribe();
        }
    }

    sendMessage() {
        const pin = this.activatedRoute.snapshot.queryParams['pin'];
        this.messageService.sendMessage(pin, this.chatMessage);
        this.chatMessage = '';
    }
}
