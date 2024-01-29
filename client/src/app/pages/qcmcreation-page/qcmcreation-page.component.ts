import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'app-qcmcreation-page',
    templateUrl: './qcmcreation-page.component.html',
    styleUrls: ['./qcmcreation-page.component.scss'],
})
export class QCMCreationPageComponent implements OnInit {
    title = 'hi';
    quizForm: FormGroup;

    constructor(private formBuilder: FormBuilder) {}

    get questions(): FormArray {
        return this.quizForm.get('answers') as FormArray;
    }

    ngOnInit() {
        this.quizForm = this.formBuilder.group({
            quizTitle: ['', Validators.required],
            quizDescritpion: ['', Validators.required],
            questions: this.formBuilder.array([]),
            answerTime: [10, Validators.required],
        });
    }

    addQuestion() {
        const modal = document.getElementById('question-creation-modal');
        if (modal) {
            modal.setAttribute('visibility', 'visible');
        }
    }

    submitQuiz() {
        window.console.log('Form submitted:', this.quizForm.value);
        // send info to where it needs to go
    }
}
