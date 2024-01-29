// import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'app-create-question-modal',
    templateUrl: './create-question-modal.component.html',
    styleUrls: ['./create-question-modal.component.scss'],
})
export class CreateQuestionModalComponent implements OnInit {
    questionForm: FormGroup;

    constructor(private formBuilder: FormBuilder) {}

    get answers(): FormArray {
        return this.questionForm.get('answers') as FormArray;
    }

    ngOnInit() {
        this.questionForm = this.formBuilder.group({
            question: ['', Validators.required],
            selectedNumber: [2, Validators.required], // Default value is 2
            answers: this.formBuilder.array([]),
        });
    }

    submitNewQuestion() {
        window.console.log('Form submitted:', this.questionForm.value);
        this.closeModal();
    }

    setUpModal() {
        let numberOfAnswers;
        const selectedNumber = this.questionForm.get('selectedNumber');
        if (selectedNumber) {
            numberOfAnswers = selectedNumber.value;
        }
        const answersArray = this.questionForm.get('answers') as FormArray;

        while (answersArray.length < numberOfAnswers) {
            answersArray.push(
                this.formBuilder.group({
                    answerText: ['', Validators.required],
                    isCorrect: false,
                    rangeValue: [0, Validators.required],
                }),
            );
        }

        while (answersArray.length > numberOfAnswers) {
            answersArray.removeAt(answersArray.length - 1);
        }
    }

    closeModal() {
        // Your existing closeModal logic
    }

    openModal() {
        // Your existing openModal logic
    }

    // onDrop(event: CdkDragDrop<any[]>) {
    //     moveItemInArray(this.answers.controls, event.previousIndex, event.currentIndex);
    // }
}
