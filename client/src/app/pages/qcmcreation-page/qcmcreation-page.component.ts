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
        const questionText = document.createElement('p');
        questionText.textContent = question;
        object.appendChild(questionText);
        return object;
    }

    addQuestion() {
        const modal = document.getElementById('question-creation-modal');
        if (modal) {
            modal.setAttribute('visibility', 'visible');
        }
    }
}
