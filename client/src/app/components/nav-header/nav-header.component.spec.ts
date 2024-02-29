import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavHeaderComponent } from './nav-header.component';
import { Location } from '@angular/common';

describe('NavHeaderComponent', () => {
    let component: NavHeaderComponent;
    let fixture: ComponentFixture<NavHeaderComponent>;
    let locationSpy: jasmine.SpyObj<Location>;

    beforeEach(() => {
        const locationSpyObj = jasmine.createSpyObj('Location', ['back']);

        TestBed.configureTestingModule({
            declarations: [NavHeaderComponent],
            providers: [{ provide: Location, useValue: locationSpyObj }],
        });

        fixture = TestBed.createComponent(NavHeaderComponent);
        component = fixture.componentInstance;
        locationSpy = TestBed.inject(Location) as jasmine.SpyObj<Location>;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call location.back() in back', () => {
        component.back();
        expect(locationSpy.back).toHaveBeenCalled();
    });
});