import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { GameServicesProvider } from '@app/providers/game-services.provider';
import { GameHttpService } from '@app/services/game-http/game-http.service';
import { GameService } from '@app/services/game/game-service/game.service';
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
    remainigInputCount: number = MAX_MESSAGE_LENGTH;
    chatlogs: Chatlog[] = [];

    formGroup: FormGroup;
    private eventSubscriptions: Subscription[] = [];

    private readonly gameHttpService: GameHttpService;
    private readonly gameService: GameService;
    private readonly messageService: MessageService;
    private readonly playerService: PlayerService;

    constructor(formBuilder: FormBuilder, gameServicesProvider: GameServicesProvider) {
        this.formGroup = formBuilder.group({
            message: [this.pin, [Validators.required, this.messageValidator()]],
        });
        this.gameHttpService = gameServicesProvider.gameHttpService;
        this.gameService = gameServicesProvider.gameService;
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

            this.gameService.onStartGame(this.pin, () => {
                this.chatlogs = [];
            }),
        );
    }

    ngOnDestroy() {
        this.eventSubscriptions.forEach((sub) => {
            if (!sub.closed) {
                sub.unsubscribe();
            }
        });
    }

    isCurrentUser(author: string): boolean {
        return this.playerService.getCurrentPlayerFromGame(this.pin)?.username?.toLowerCase() === author.toLowerCase();
    }

    updateRemainingInputCount() {
        this.remainigInputCount = MAX_MESSAGE_LENGTH - this.input.length;
    }

    sendMessage() {
        if (this.remainigInputCount >= 0 && this.remainigInputCount < MAX_MESSAGE_LENGTH) {
            this.messageService.sendMessage(this.pin, this.input);
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
        return (): ValidationErrors | null => {
            return this.remainigInputCount >= 0 ? null : { ok: true };
        };
    }
}
