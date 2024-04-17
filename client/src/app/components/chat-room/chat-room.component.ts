import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MAX_MESSAGE_LENGTH, NOTICE_DURATION_MS } from '@app/constants/constants';
import { GameServicesProvider } from '@app/providers/game-services.provider';
import { GameHttpService } from '@app/services/game-http/game-http.service';
import { MessageService } from '@app/services/message/message.service';
import { PlayerService } from '@app/services/player/player.service';
import { SubscriptionService } from '@app/services/subscription/subscription.service';
import { Chatlog } from '@common/chatlog';
import { v4 as uuidv4 } from 'uuid';

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

    private readonly uuid = uuidv4();
    private readonly gameHttpService: GameHttpService;
    private readonly messageService: MessageService;
    private readonly playerService: PlayerService;

    // Depends on many services
    // eslint-disable-next-line max-params
    constructor(
        formBuilder: FormBuilder,
        gameServicesProvider: GameServicesProvider,
        private readonly snackBarService: MatSnackBar,
        private readonly subscriptionService: SubscriptionService,
    ) {
        this.formGroup = formBuilder.group({
            message: [this.pin, [Validators.required, this.messageValidator()]],
        });
        this.gameHttpService = gameServicesProvider.gameHttpService;
        this.messageService = gameServicesProvider.messageService;
        this.playerService = gameServicesProvider.playerService;
    }

    ngOnInit() {
        this.setupSubscriptions(this.pin);
    }

    ngOnDestroy() {
        this.subscriptionService.clear(this.uuid);
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

    private setupSubscriptions(pin: string) {
        this.subscriptionService.add(
            this.uuid,
            this.messageService.onSendMessage(pin, (chatlog: Chatlog) => {
                this.chatlogs.push(chatlog);
            }),
            this.gameHttpService.getGameSnapshotByPin(pin).subscribe((snapshot) => {
                this.chatlogs = snapshot.chatlogs;
            }),
            this.playerService.onPlayerMute(this.pin, (player) => {
                if (player.isMuted) {
                    if (this.playerService.getCurrentPlayer(pin)?.socketId === player.socketId) {
                        this.snackBarService.open('Vous avez été réduit au silence', '', {
                            duration: NOTICE_DURATION_MS,
                            verticalPosition: 'top',
                            panelClass: ['base-snackbar'],
                        });
                    }
                } else {
                    if (this.playerService.getCurrentPlayer(pin)?.socketId === player.socketId) {
                        this.snackBarService.open('Vous pouvez parler de nouveau', '', {
                            duration: NOTICE_DURATION_MS,
                            verticalPosition: 'top',
                            panelClass: ['base-snackbar'],
                        });
                    }
                }
            }),
            this.playerService.onPlayerBan(pin, (player) => {
                if (player) {
                    this.chatlogs.push({
                        author: 'Système',
                        message: `${player.username} a été banni`,
                        date: new Date(),
                    });
                }
            }),
            this.playerService.onPlayerAbandon(pin, (player) => {
                if (player) {
                    this.chatlogs.push({
                        author: 'Système',
                        message: `${player.username} a quitté la partie`,
                        date: new Date(),
                    });
                }
            }),
        );
    }
}
