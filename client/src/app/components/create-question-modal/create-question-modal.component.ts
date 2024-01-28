import { Component } from '@angular/core';

@Component({
    selector: 'app-create-question-modal',
    templateUrl: './create-question-modal.component.html',
    styleUrls: ['./create-question-modal.component.scss'],
})
export class CreateQuestionModalComponent {
    selectedNumber: number = 0;
    submitNewQeustion() {
        window.console.log('i function');
        this.closeModal();
    }

    closeModal() {
        const modal = document.getElementById('question-creation-modal');
        if (modal) modal.setAttribute('display', 'block');
    }

    openModal() {
        const modal = document.getElementById('question-creation-modal');
        if (modal) modal.setAttribute('display', 'flex');
    }

    createPointSelectHTML(answerNumber: number) {
        return answerNumber;
    }

    createAnswerHTML(answerNumber: number) {
        const answerDiv = document.createElement('div');
        answerDiv.classList.add('flex-row');
        const answerArea = document.createElement('textarea');
        const questionNumber = document.createElement('p');
        const checkBox = document.createElement('input');
        checkBox.setAttribute('type', 'checkbox');
        checkBox.name = 'trueOrFalse';
        checkBox.value = `${answerNumber}`;
        questionNumber.textContent = '# ' + answerNumber;
        answerArea.id = 'answer' + answerNumber;
        answerDiv.appendChild(questionNumber);
        answerDiv.appendChild(answerArea);
        answerDiv.appendChild(checkBox);
        return answerDiv;
    }

    setUpModal() {
        const answersDiv = document.getElementById('modal-answers-container');
        if (answersDiv) {
            while (answersDiv.children.length > this.selectedNumber) {
                const child = answersDiv.lastChild;
                if (child) {
                    answersDiv.removeChild(child);
                }
            }
            for (let i = answersDiv.children.length; i < this.selectedNumber; i++) {
                answersDiv.appendChild(this.createAnswerHTML(i));
            }
        }
        this.selectedNumber = 0;
    }
}
