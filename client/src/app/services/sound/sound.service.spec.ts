import { TestBed } from '@angular/core/testing';
import { SoundService } from './sound.service';

describe('SoundService', () => {
    let service: SoundService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SoundService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('loadSound', () => {
        it('should load a sound', () => {
            const name = 'testSound';
            const path = '/assets/sounds/test-sound.wav';

            service.loadSound(name, path);

            expect(service['audios'].has(name)).toBeTrue();
        });

        it('should not load a sound if it already exists', () => {
            const name = 'testSound';
            const path = '/assets/sounds/test-sound.wav';

            service.loadSound(name, path);
            const sizeBefore = service['audios'].size;

            service.loadSound(name, path);

            expect(service['audios'].size).toBe(sizeBefore);
        });
    });

    describe('playSound', () => {
        it('should play a loaded sound', () => {
            const name = 'testSound';
            const path = '/assets/sounds/test-sound.wav';

            spyOn(service['audioContext'], 'createMediaElementSource').and.callThrough();
            service.loadSound(name, path);

            spyOn(service['audios'].get(name) as HTMLAudioElement, 'play');
            service.playSound(name);

            expect(service['audioContext'].createMediaElementSource).toHaveBeenCalled();
            expect(service['audios'].get(name)?.play).toHaveBeenCalled();
        });

        it('should not play a sound if it is not loaded', () => {
            const name = 'testSound';
            spyOn(service['audioContext'], 'createMediaElementSource');
            const playSpy = spyOn(service, 'play' as never);

            service.playSound(name);

            expect(playSpy).not.toHaveBeenCalled();
        });
    });

    describe('stopSound', () => {
        it('should stop a playing sound', () => {
            const name = 'testSound';
            const path = '/assets/sounds/test-sound.wav';
            service.loadSound(name, path);

            spyOn(service['audios'].get(name) as HTMLAudioElement, 'pause');
            spyOnProperty(service['audios'].get(name) as HTMLAudioElement, 'currentTime', 'set');

            service.stopSound(name);

            expect(service['audios'].get(name)?.pause).toHaveBeenCalled();
            expect((service['audios'].get(name) as HTMLAudioElement).currentTime).toBe(0);
        });

        it('should not stop a sound if it is not loaded', () => {
            const name = 'testSound';
            const stopSpy = spyOn(service, 'stop' as never);

            service.stopSound(name);

            expect(stopSpy).not.toHaveBeenCalled();
        });
    });
});
