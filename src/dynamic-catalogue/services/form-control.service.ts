import {Injectable, OnInit} from '@angular/core';
import {UntypedFormArray, UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {Field, Model, Required, Section} from '../domain/dynamic-form-model';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {urlRegEx} from "../shared/validators/generic.validator";
import {Paging} from "../domain/paging";

@Injectable()
export class FormControlService implements OnInit{
  constructor(public http: HttpClient) { }

  base = environment.API_ENDPOINT;
  private options = {withCredentials: true};
  urlRegEx = urlRegEx;
  numbersOfDecimals = '1';
  numberRegEx = `^(\\d)*(\\.)?([0-9]{${this.numbersOfDecimals}})?$`;
  // numberRegEx = `^[0-9]*[\\.]?[0-9]{${this.numbersOfDecimals}}?$`;

  ngOnInit() {
  }

  getFormModelById(id: string) {
    return this.http.get<Model>(this.base + `/forms/models/${id}`);
  }

  getFormModelByResourceType(type: string) {
    return this.http.get<Paging<Model>>(this.base + `/forms/models?resourceType=${type}`);
  }

  getFormModelByName(name: string) {
    return this.http.get<Paging<Model>>(this.base + `/forms/models?name=${name}`);
  }

  postItem(surveyId: string, item: any, edit:boolean) {
    return this.http[edit ? 'put' : 'post'](this.base + `/answers/${surveyId}/answer`, item, this.options);
  }

  postGenericItem(resourceType: string, item, edit?: boolean) {
    // console.log(item[Object.keys(item)[0]]);
    return this.http.post(this.base + `/items?resourceType=${resourceType}`, item[Object.keys(item)[0]]);
  }

  putGenericItem(id: string, resourceType: string, item: object) {
    return this.http.put(this.base + `/items/${id}?resourceType=${resourceType}`, item[Object.keys(item)[0]]);
  }

  validateUrl(url: string) {
    // console.log(`knocking on: ${this.base}/provider/validateUrl?urlForValidation=${url}`);
    return this.http.get<boolean>(this.base + `/provider/validateUrl?urlForValidation=${url}`);
  }

  toFormGroup(form: Section[], checkImmutable: boolean) {
    const group: any = {};
    form.forEach(groups => {
      groups.fields.sort((a, b) => a.form.display?.order - b.form.display?.order)
      groups.required = new Required();
      groups.fields.forEach(formField => {
        if (formField.deprecated)
          return;

        if (formField.form.mandatory) {
          groups.required.topLevel++;
          groups.required.total++;
        }
        // if (formField.form.immutable === checkImmutable) {
          if (formField.typeInfo.multiplicity) {
            if (formField.typeInfo.type === 'url') {
              group[formField.name] = formField.form.mandatory ?
                new UntypedFormArray([new UntypedFormControl(null, Validators.compose([Validators.required, Validators.pattern(this.urlRegEx)]))])
                : new UntypedFormArray([new UntypedFormControl(null, Validators.pattern(this.urlRegEx))]);
            } else if (formField.typeInfo.type === 'composite' || formField.typeInfo.type === 'chooseOne') {
              group[formField.name] = formField.form.mandatory ? new UntypedFormArray([], Validators.required)
                : new UntypedFormArray([]);
              group[formField.name].push(this.createCompositeField(formField));
            } else {
              group[formField.name] = formField.form.mandatory ?
                new UntypedFormArray([new UntypedFormControl(null, Validators.required)])
                : new UntypedFormArray([new UntypedFormControl(null)]);
            }
          } else {
            if (formField.typeInfo.type === 'url') {
              group[formField.name] = formField.form.mandatory ?
              new UntypedFormControl(null, [Validators.required, Validators.pattern(this.urlRegEx)])
                : new UntypedFormControl(null, Validators.pattern(this.urlRegEx));
            } else if (formField.typeInfo.type === 'composite' || formField.typeInfo.type === 'chooseOne') {
              if (group.hasOwnProperty(formField.name)) { // merge the controls to one formGroup
                (group[formField.name] as UntypedFormGroup).controls = {...(group[formField.name] as UntypedFormGroup).controls, ...this.createCompositeField(formField).controls}
              } else
                group[formField.name] = this.createCompositeField(formField);
            } else if (formField.typeInfo.type === 'email') {
              group[formField.name] = formField.form.mandatory ?
                new UntypedFormControl(null, Validators.compose([Validators.required, Validators.email]))
                : new UntypedFormControl(null, Validators.email);
            } else if (formField.typeInfo.type === 'phone') {
              group[formField.name] = formField.form.mandatory ?
                new UntypedFormControl(null, Validators.compose([Validators.required, Validators.pattern('[+]?\\d+$')]))
                : new UntypedFormControl(null, Validators.pattern('[+]?\\d+$'));
            } else if (formField.typeInfo.type === 'number') {
              // if (formField.typeInfo.values) {
                this.numberRegEx = this.calculateNumberOfDecimals(formField.typeInfo.values);
                group[formField.name] = formField.form.mandatory ?
                  new UntypedFormControl(null, Validators.compose([Validators.required, Validators.pattern(this.numberRegEx)]))
                  : new UntypedFormControl(null, Validators.compose([Validators.pattern(this.numberRegEx)]));
              // } else {
              //   group[formField.name] = formField.form.mandatory ?
              //     new FormControl(null, Validators.required) : new FormControl(null);
              // }

            } else {
              group[formField.name] = formField.form.mandatory ? new UntypedFormControl(null, Validators.required)
                : new UntypedFormControl(null);
            }
          }
        // }
      });
    });
    return new UntypedFormGroup(group);
  }

  createCompositeField(formField: Field) {
    const subGroup: any = {};
    // console.log(formField);
    formField.subFields?.sort((a, b) => a.form.display?.order - b.form.display?.order)
    formField.subFields?.forEach(subField => {
      if (subField.deprecated)
        return;

      if (subField.typeInfo.type === 'composite' || subField.typeInfo.type === 'radioGrid') {
        if (subField.typeInfo.multiplicity) {
          subGroup[subField.name] = subField.form.mandatory ? new UntypedFormArray([], Validators.required)
            : new UntypedFormArray([]);
          subGroup[subField.name].push(this.createCompositeField(subField));
        } else {
          subGroup[subField.name] = this.createCompositeField(subField);
        }
      } else if (subField.typeInfo.type === 'email') {
        subGroup[subField.name] = subField.form.mandatory ?
          new UntypedFormControl(null, Validators.compose([Validators.required, Validators.email]))
          : new UntypedFormControl(null, Validators.email);
      } else if (subField.typeInfo.type === 'phone') {
        subGroup[subField.name] = subField.form.mandatory ?
          new UntypedFormControl(null, Validators.compose([Validators.required, Validators.pattern('[+]?\\d+$')]))
          : new UntypedFormControl(null, Validators.pattern('[+]?\\d+$'));
      } else if (subField.typeInfo.multiplicity) { // add array inside composite element
        subGroup[subField.name] = subField.form.mandatory ?
          new UntypedFormArray([new UntypedFormControl(null, Validators.required)])
          : new UntypedFormArray([new UntypedFormControl(null)]);
      } else if (subField.typeInfo.type === 'url') {
        subGroup[subField.name] = subField.form.mandatory ?
        new UntypedFormControl(null, [Validators.required, Validators.pattern(this.urlRegEx)])
            : new UntypedFormControl(null, Validators.pattern(this.urlRegEx));
      } else if (subField.typeInfo.type === 'number') {
        // if (subField.typeInfo.values) {
        subGroup[subField.name] = subField.form.mandatory ?
          new UntypedFormControl(null, [Validators.required, Validators.pattern(this.calculateNumberOfDecimals(subField.typeInfo.values))])
          : new UntypedFormControl(null, Validators.compose([Validators.pattern(this.calculateNumberOfDecimals(subField.typeInfo.values))]));
        // } else {
        //   subGroup[subField.name] = subField.form.mandatory ?
        //     new FormControl(null, Validators.required) : new FormControl(null);
        // }
      } else {
        subGroup[subField.name] = subField.form.mandatory ?
          new UntypedFormControl(null, Validators.required)
          : new UntypedFormControl(null);
      }
    });
    return new UntypedFormGroup(subGroup);
  }

  createField (formField: Field): UntypedFormControl | UntypedFormGroup {
    if (formField.typeInfo.type === 'url') {
      return formField.form.mandatory ?
        new UntypedFormControl('', [Validators.required, Validators.pattern(this.urlRegEx)])
        : new UntypedFormControl('', Validators.pattern(this.urlRegEx));
    } else if (formField.typeInfo.type === 'composite' || formField.typeInfo.type === 'chooseOne') {
      return this.createCompositeField(formField);
    } else if (formField.typeInfo.type === 'email') {
      return formField.form.mandatory ?
        new UntypedFormControl('', Validators.compose([Validators.required, Validators.email]))
        : new UntypedFormControl('', Validators.email);
    } else if (formField.typeInfo.type === 'phone') {
      return formField.form.mandatory ?
        new UntypedFormControl('', Validators.compose([Validators.required, Validators.pattern('[+]?\\d+$')]))
        : new UntypedFormControl('', Validators.pattern('[+]?\\d+$'));
    } else if (formField.typeInfo.type === 'number') {
      // if (formField.typeInfo.values) {
        this.numberRegEx = this.calculateNumberOfDecimals(formField.typeInfo.values);
        return formField.form.mandatory ?
          new UntypedFormControl('', Validators.compose([Validators.required, Validators.pattern(this.numberRegEx)]))
          : new UntypedFormControl('', Validators.compose([Validators.pattern(this.numberRegEx)]));
      // } else {
      //   return formField.form.mandatory ? new FormControl('', Validators.required) : new FormControl('');
      // }

    } else {
      return new UntypedFormControl(null, Validators.required)
    }
  }

  calculateNumberOfDecimals(values: string[]): string {
    let decimals: string;
    if (values) {
      let str = values[0].split('.');

      if (str.length > 0) {
        if (str[1].length === 1) {
          decimals = '1';
        } else if (str[1].length === 2) {
          decimals = '0,2';
        }
        decimals = `0,${str[1].length}`
      }
    } else
      decimals = '0';

    return `^(\\d)*(\\.)?([0-9]{${decimals}})?$`;
  }

  static removeNulls(obj: any) {
    const isArray = obj instanceof Array;
    for (const k in obj) {
      if (obj[k] === null || obj[k] === '') {
        // TODO: check 'obj.splice(k, 1)', is k supposed to be a number? if not then fix this method
        isArray ? obj.splice(+k, 1) : delete obj[k];
      } else if (typeof obj[k] === 'object') {
        if (typeof obj[k].value !== 'undefined' && typeof obj[k].lang !== 'undefined') {
          if (obj[k].value === '' && obj[k].lang === 'en') {
            obj[k].lang = '';
          }
        }
        FormControlService.removeNulls(obj[k]);
      }
      if (obj[k] instanceof Array && obj[k].length === 0) {
        delete obj[k];
      } else if (obj[k] instanceof Array) {
        for (const l in obj[k]) {
          if (obj[k][l] === null || obj[k][l] === '') {
            delete obj[k][l];
          }
        }
      }
    }
  }

}
