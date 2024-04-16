import { Subscription } from 'rxjs';
import { SubscriptionService } from './subscription.service';

describe('SubscriptionService', () => {
    let service: SubscriptionService;

    beforeEach(() => {
        service = new SubscriptionService();
    });

    afterEach(() => {
        service['subscriptions'].clear();
    });

    it('should add subscriptions', () => {
        const uuid = '123';
        const subscriptions = [new Subscription(), new Subscription()];

        service.add(uuid, ...subscriptions);
        expect(service['subscriptions'].get(uuid)).toEqual(subscriptions);

        const newSubscription = new Subscription();
        service.add(uuid, newSubscription);
        expect(service['subscriptions'].get(uuid)).toEqual([...subscriptions, newSubscription]);
    });

    it('should clear subscriptions', () => {
        const uuid = '123';
        const subscriptions = [new Subscription(), new Subscription()];
        const unsubscribeSpy = spyOn(Subscription.prototype, 'unsubscribe');
        service.add(uuid, ...subscriptions);

        expect(service['subscriptions'].get(uuid)).toEqual(subscriptions);

        service.clear(uuid);
        expect(unsubscribeSpy).toHaveBeenCalledTimes(subscriptions.length);
        expect(service['subscriptions'].get(uuid)).toEqual(undefined);
    });
});
