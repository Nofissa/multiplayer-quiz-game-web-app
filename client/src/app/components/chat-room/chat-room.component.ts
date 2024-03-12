import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from '@app/services/message/message.service';
import { UserService } from '@app/services/user/user-service';
import { Chatlog } from '@common/chatlog';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-chat-room',
    templateUrl: './chat-room.component.html',
    styleUrls: ['./chat-room.component.scss'],
})
export class ChatRoomComponent implements OnInit, OnDestroy {
    pin: string;
    chatMessage = '';
    chatlogs: Chatlog[] = [];
    private messageSubscription: Subscription = new Subscription();

    constructor(
        private readonly messageService: MessageService,
        private readonly activatedRoute: ActivatedRoute,
        private readonly userService: UserService,
    ) {}

    ngOnInit() {
        this.pin = this.pin || this.activatedRoute.snapshot.queryParams['pin'];
        this.chatlogs = this.messageService.getGameChatlogs(this.pin);
        this.messageSubscription = this.messageService.onSendMessage(this.pin, (chatlog: Chatlog) => {
            this.chatlogs.push(chatlog);
        });
    }

    ngOnDestroy() {
        if (!this.messageSubscription.closed) {
            this.messageSubscription.unsubscribe();
        }
    }

    sendMessage() {
        this.messageService.sendMessage(this.pin, this.chatMessage);
        this.chatMessage = '';
    }

    isCurrentUser(author: string): boolean {
        return author === this.userService.getUsername();
    }
}
