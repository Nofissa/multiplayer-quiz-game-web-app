import { Component } from '@angular/core';

@Component({
    selector: 'app-qcmcreation-page',
    templateUrl: './qcmcreation-page.component.html',
    styleUrls: ['./qcmcreation-page.component.scss'],
})
export class QCMCreationPageComponent {
    title = 'hi';

    createQuestionHTML(question: string) {
        const object = document.createElement('div');
        object.setAttribute('class', 'question');
        const questionText = document.createElement('p');
        questionText.textContent = question;
        object.appendChild(questionText);
        return object;
    }

    addQuestion() {
        const container = document.getElementById('question-container');
        if (container) {
            container.appendChild(this.createQuestionHTML('hi'));
        }
    }
}
