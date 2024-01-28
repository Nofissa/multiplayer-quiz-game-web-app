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

    createAnswerHTML(answerNumber: number) {
        const answerDiv = document.createElement('div');
        answerDiv.classList.add('flex-row');
        const answerArea = document.createElement('textarea');
        const questionNumber = document.createElement('p');
        const checkBox = document.createElement('input');
        const rangeBar = document.createElement('input');

        const minLabel = document.createElement('span');
        const maxLabel = document.createElement('span');

        checkBox.type = 'checkbox';
        checkBox.name = 'trueOrFalse';
        checkBox.value = `${answerNumber}`;

        rangeBar.type = 'range';
        rangeBar.style.display = 'none';
        rangeBar.min = '0';
        rangeBar.max = '100';
        rangeBar.step = '10';

        minLabel.textContent = '0';
        maxLabel.textContent = '100';
        minLabel.style.display = 'none';
        maxLabel.style.display = 'none';

        checkBox.addEventListener('click', () => {
            if (rangeBar.style.display !== 'none') {
                rangeBar.style.display = 'none';
                minLabel.style.display = 'none';
                maxLabel.style.display = 'none';
            } else {
                rangeBar.style.display = 'flex';
                minLabel.style.display = 'flex';
                maxLabel.style.display = 'flex';
            }
        });

        questionNumber.textContent = '# ' + answerNumber;

        answerArea.id = 'answer' + answerNumber;

        answerDiv.appendChild(questionNumber);
        answerDiv.appendChild(answerArea);
        answerDiv.appendChild(checkBox);
        answerDiv.appendChild(minLabel);
        answerDiv.appendChild(rangeBar);
        answerDiv.appendChild(maxLabel);
        return answerDiv;
    }

    setUpModal() {
        const answersDiv = document.getElementById('modal-answers-container');
        if (answersDiv) {
            while (answersDiv.children.length + 1 > this.selectedNumber) {
                const child = answersDiv.lastChild;
                if (child) {
                    answersDiv.removeChild(child);
                }
            }
            for (let i = answersDiv.children.length + 1; i <= this.selectedNumber; i++) {
                answersDiv.appendChild(this.createAnswerHTML(i));
            }
        }
        this.selectedNumber = 0;
    }
}
