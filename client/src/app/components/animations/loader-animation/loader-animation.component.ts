import { Component } from '@angular/core';
import { NUMBER_OF_LOADER_LINES } from '@app/constants/constants';

@Component({
    selector: 'app-loader-animation',
    templateUrl: './loader-animation.component.html',
    styleUrls: ['./loader-animation.component.scss'],
})
export class LoaderAnimationComponent {
    loaderLines = Array(NUMBER_OF_LOADER_LINES);
}
