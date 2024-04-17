import { Location } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-nav-header',
    templateUrl: './nav-header.component.html',
    styleUrls: ['./nav-header.component.scss'],
})
export class NavHeaderComponent {
    @Input()
    pin: string | null = null;
    @Input()
    isActive = true;
    @Input()
    backArrow = true;
    @Output()
    navigation: EventEmitter<void> = new EventEmitter<void>();

    constructor(private readonly location: Location) {}

    back() {
        this.location.back();
    }

    emitNavigationEvent() {
        this.navigation.emit();
    }
}
