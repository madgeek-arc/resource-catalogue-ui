import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ResourceService} from '../../services/resource.service';

@Component({
  selector: 'app-indicator-form',
  templateUrl: 'indicator-form.component.html'
})

export class IndicatorFromComponent implements OnInit {
  formPrepare = {
    id: ['', Validators.required],
    name: ['', Validators.required],
    description: ['', Validators.required],
    dimensions: this.fb.array([
      // this.fb.control('', Validators.required)
    ], Validators.required),
    unit: ['', Validators.required],
    unitName: ['']
  };

  indicatorForm: FormGroup;
  public errorMessage: string;

  constructor(private fb: FormBuilder,
              private resourceService: ResourceService) {}

  ngOnInit(): void {
    this.indicatorForm = this.fb.group(this.formPrepare);
  }

  get dimensions() {
    return this.indicatorForm.get('dimensions') as FormArray;
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

  handleDropDown(event) {
    if (event.target.value === 'boolean') {
      this.indicatorForm.get('unitName').reset();
      this.indicatorForm.get('unitName').disable();
    } else if (event.target.value === 'percentage') {
      this.indicatorForm.get('unitName').reset();
      this.indicatorForm.get('unitName').setValue('%');
      this.indicatorForm.get('unitName').disable();
    } else {
      this.indicatorForm.get('unitName').reset();
      this.indicatorForm.get('unitName').enable();
    }
  }

  unCheck(id: string) {
    const x = <HTMLInputElement>document.getElementById(id);
    x.checked = false;
  }

  submitIndicator() {
    this.errorMessage = '';
    this.indicatorForm.get('unitName').enable();
    if (this.indicatorForm.valid) {
      return this.resourceService.postIndicator(this.indicatorForm.value).subscribe(
        suc => console.log(suc),
        er => this.errorMessage = er.error.error,
        () => {
          this.indicatorForm.reset();
          this.indicatorForm.get('unit').setValue('');
          this.unCheck('time');
          this.unCheck('locations');
        }
      );
    } else {
      window.scroll(0, 0);
      this.errorMessage = 'Please fill in all required fields';
      if (this.indicatorForm.get('dimensions').invalid) {
        this.errorMessage = this.errorMessage + '. You should pick at least one dimension';
      }
      for (const control in this.indicatorForm.controls) {
        // console.log(control);
        this.indicatorForm.get(control).markAsDirty();
        this.indicatorForm.get(control).markAsTouched();
      }
    }
  }

}
