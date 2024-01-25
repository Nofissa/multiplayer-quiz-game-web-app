import { Message } from '@common/message';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ExampleService {
    private clientMessages: Message[];

    constructor(private readonly logger: Logger) {
        this.clientMessages = [];
    }

    about(): Message {
        return {
            title: 'Basic Server About Page',
            body: 'Try calling /api/docs to get the documentation',
        };
    }

    storeMessage(message: Message): void {
        this.logger.log(message);
        this.clientMessages.push(message);
    }

    getAllMessages(): Message[] {
        return this.clientMessages;
    }
}
