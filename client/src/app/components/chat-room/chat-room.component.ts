import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MAX_MESSAGE_LENGTH } from '@app/constants/constants';
import { GameServicesProvider } from '@app/providers/game-services.provider';
import { GameHttpService } from '@app/services/game-http/game-http.service';
import { MessageService } from '@app/services/message/message.service';
import { PlayerService } from '@app/services/player/player.service';
import { Chatlog } from '@common/chatlog';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-chat-room',
    templateUrl: './chat-room.component.html',
    styleUrls: ['./chat-room.component.scss'],
})
export class ChatRoomComponent implements OnInit, OnDestroy {
    @Input()
    pin: string;
    input: string = '';
    remainigInputCount: number = MAX_MESSAGE_LENGTH;
    chatlogs: Chatlog[] = [];

    formGroup: FormGroup;
    private eventSubscriptions: Subscription[] = [];

    private readonly gameHttpService: GameHttpService;
    private readonly messageService: MessageService;
    private readonly playerService: PlayerService;

    constructor(formBuilder: FormBuilder, gameServicesProvider: GameServicesProvider) {
        this.formGroup = formBuilder.group({
            message: [this.pin, [Validators.required, this.messageValidator()]],
        });
        this.gameHttpService = gameServicesProvider.gameHttpService;
        this.messageService = gameServicesProvider.messageService;
        this.playerService = gameServicesProvider.playerService;
    }

    ngOnInit() {
        this.gameHttpService.getGameSnapshotByPin(this.pin).subscribe((snapshot) => {
            this.chatlogs = snapshot.chatlogs;
        });
        this.eventSubscriptions.push(
            this.messageService.onSendMessage(this.pin, (chatlog: Chatlog) => {
                this.chatlogs.push(chatlog);
            }),
        );
    }

    ngOnDestroy() {
        this.eventSubscriptions.forEach((sub) => {
            if (sub && !sub.closed) {
                sub.unsubscribe();
            }
        });
    }

    isCurrentUser(author: string): boolean {
        return this.playerService.getCurrentPlayer(this.pin)?.username?.toLowerCase() === author.toLowerCase();
    }

    updateRemainingInputCount() {
        this.remainigInputCount = MAX_MESSAGE_LENGTH - this.input.length;
    }

    sendMessage() {
        const isOnlyWhitespace = /^\s*$/.test(this.input);
        if (!isOnlyWhitespace && this.input.length < MAX_MESSAGE_LENGTH) {
            this.messageService.sendMessage(this.pin, this.input.trim());
            this.input = '';
            this.remainigInputCount = MAX_MESSAGE_LENGTH;
        }
    }

    handleKeyDown(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            event.preventDefault();
            this.sendMessage();
        } else {
            this.updateRemainingInputCount();
        }
    }

    private messageValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const message = control.value as string;
            const isOnlyWhitespace = /^\s*$/.test(message);
            return !isOnlyWhitespace && message?.length < MAX_MESSAGE_LENGTH ? null : { invalidMessage: true };
        };
    }
}
