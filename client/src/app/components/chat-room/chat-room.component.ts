import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { GameHttpService } from '@app/services/game-http/game-http.service';
import { MessageService } from '@app/services/message/message.service';
import { PlayerService } from '@app/services/player/player.service';
import { Chatlog } from '@common/chatlog';
import { Subscription } from 'rxjs';

const MAX_MESSAGE_LENGTH = 200;

@Component({
    selector: 'app-chat-room',
    templateUrl: './chat-room.component.html',
    styleUrls: ['./chat-room.component.scss'],
})
export class ChatRoomComponent implements OnInit, OnDestroy {
    @Input()
    pin: string;
    input: string = '';
    inputCount: number = MAX_MESSAGE_LENGTH;
    chatlogs: Chatlog[] = [];

    formGroup: FormGroup;
    private sendMessageSubscription: Subscription = new Subscription();

    // Disabled because this component depends on many services
    // eslint-disable-next-line max-params
    constructor(
        formBuilder: FormBuilder,
        private readonly gameHttpService: GameHttpService,
        private readonly messageService: MessageService,
        private readonly playerService: PlayerService,
    ) {
        this.formGroup = formBuilder.group({
            message: [this.pin, [Validators.required, this.messageValidator()]],
        });
    }

    ngOnInit() {
        this.gameHttpService.getGameSnapshotByPin(this.pin).subscribe((snapshot) => {
            this.chatlogs = snapshot.chatlogs;
        });
        this.sendMessageSubscription = this.messageService.onSendMessage(this.pin, (chatlog: Chatlog) => {
            this.chatlogs.push(chatlog);
        });
    }

    ngOnDestroy() {
        if (!this.sendMessageSubscription.closed) {
            this.sendMessageSubscription.unsubscribe();
        }
    }

    sendMessage() {
        if (this.inputCount >= 0) {
            this.messageService.sendMessage(this.pin, this.input);
            this.input = '';
            this.inputCount = MAX_MESSAGE_LENGTH;
        }
    }

    isCurrentUser(author: string): boolean {
        return author === this.playerService.getPlayer(this.pin)?.username;
    }

    updateInputCount() {
        this.inputCount = MAX_MESSAGE_LENGTH - this.input.length;
    }

    private messageValidator(): ValidatorFn {
        return (): ValidationErrors | null => {
            return this.inputCount > 0 ? null : { ok: true };
        };
    }
}
