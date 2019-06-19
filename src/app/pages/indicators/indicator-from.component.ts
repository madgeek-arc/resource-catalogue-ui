import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-indicator-form',
  templateUrl: 'indicator-form.component.html'
})

export class IndicatorFromComponent implements OnInit {
  formPrepare = {
    id: ['', Validators.required],
    name: ['', Validators.required],
    description: ['', Validators.required],
    dimension: this.fb.array([
      // this.fb.control('', Validators.required)
    ], Validators.required),
    unit: ['', Validators.required],
    unitName: ['']
  };

  indicatorForm: FormGroup;
  public errorMessage: string;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.indicatorForm = this.fb.group(this.formPrepare);
  }

  get dimensions() {
    return this.indicatorForm.get('dimension') as FormArray;
  }

  handleCheckbox(event) {
    if (event.target.checked) {
      this.dimensions.push(this.fb.control(event.target.name));
    } else {
      for ( let i = 0; i < this.dimensions.length; i++) {
        if ( this.dimensions.controls[i].value === event.target.name) {
          this.dimensions.removeAt(i);
        }
      }
    }
    // console.log(this.dimensions.controls);
  }

  submitIndicator() {
    this.errorMessage = '';
    if (this.indicatorForm.valid) {

    } else {
      window.scroll(0, 0);
      this.errorMessage = 'Please fill in all required fields';
      for (const control in this.indicatorForm.controls) {
        // console.log(control);
        this.indicatorForm.get(control).markAsDirty();
        this.indicatorForm.get(control).markAsTouched();
      }
    }
  }
}
