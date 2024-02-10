import { Component } from '@angular/core';

const NUMBER_OF_LOADER_LINES = 5;

@Component({
    selector: 'app-loader-animation',
    templateUrl: './loader-animation.component.html',
    styleUrls: ['./loader-animation.component.scss'],
})
export class LoaderAnimationComponent {
    loaderLines = Array(NUMBER_OF_LOADER_LINES);
}
