import { Location } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-nav-header',
    templateUrl: './nav-header.component.html',
    styleUrls: ['./nav-header.component.scss'],
})
export class NavHeaderComponent {
    @Input()
    isActive = true;
    @Input()
    backArrow = true;

    @Input()
    pin: string | null = null;

    constructor(private readonly location: Location) {}

    back() {
        this.location.back();
    }
}
