import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class SubscriptionService {
    private subscriptions: Map<string, Subscription[]> = new Map();

    add(uuid: string, ...subscriptions: Subscription[]) {
        let existingSubscriptions = this.subscriptions.get(uuid);

        existingSubscriptions = existingSubscriptions ? [...existingSubscriptions, ...subscriptions] : [...subscriptions];
        this.subscriptions.set(uuid, existingSubscriptions);
    }

    clear(uuid: string) {
        this.subscriptions.get(uuid)?.forEach((x) => {
            x.unsubscribe();
        });

        this.subscriptions.delete(uuid);
    }
}
