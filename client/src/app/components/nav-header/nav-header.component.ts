import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
    selector: 'app-nav-header',
    templateUrl: './nav-header.component.html',
    styleUrls: ['./nav-header.component.scss'],
})
export class NavHeaderComponent {
    constructor(private readonly location: Location) {}

    back() {
        this.location.back();
    }
}
