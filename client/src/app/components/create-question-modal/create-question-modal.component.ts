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
        if (modal) modal.setAttribute('visibility', 'visible');
    }

    setUpModal() {
        window.console.log(this.selectedNumber);
        this.selectedNumber = 0;
    }
}
