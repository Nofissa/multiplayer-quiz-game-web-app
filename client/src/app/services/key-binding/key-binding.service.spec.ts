import { TestBed } from '@angular/core/testing';
import { KeyBindingService } from './key-binding.service';

describe('KeyBindingService', () => {
    let service: KeyBindingService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [KeyBindingService],
        });
        service = TestBed.inject(KeyBindingService);
    });

    afterEach(() => {
        service['keyBindings'] = {}; // flush key bindings
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should register key binding', () => {
        const hotkey = 'Ctrl+S';
        const callback = jasmine.createSpy('callback');

        service.registerKeyBinding(hotkey, callback);

        expect(service.getExecutor(hotkey)).toBe(callback);
    });

    it('should overwrite existing key binding', () => {
        const hotkey = 'Ctrl+S';
        const initialCallbackSpy = jasmine.createSpy('initialCallback');
        const newCallbackSpy = jasmine.createSpy('newCallback');

        service.registerKeyBinding(hotkey, initialCallbackSpy);
        service.registerKeyBinding(hotkey, newCallbackSpy);

        expect(service.getExecutor(hotkey)).toBe(newCallbackSpy);
    });

    it('should return undefined key binding is unregistered', () => {
        const hotkey = 'Ctrl+S';

        expect(service.getExecutor(hotkey)).toBeUndefined();
    });
});
