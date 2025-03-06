import { Injectable } from "@angular/core";
import {
  Columns,
  Content,
  DocDefinition,
  PdfImage,
  PdfMetadata,
  PdfTable,
  TableDefinition
} from "../domain/PDFclasses";
import { Field, Model } from "../domain/dynamic-form-model";
import { AbstractControl, FormArray, FormGroup } from "@angular/forms";
import { cloneDeep } from 'lodash';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

pdfMake.vfs = pdfFonts.vfs;

@Injectable()

export class PdfGenerateService {

  generatePDF(model: Model, payload: any, form: FormGroup) {
    let docDefinition: DocDefinition = new DocDefinition();
    docDefinition.content.push(new Content(model.name, ['title']));
    if (model.notice)
      docDefinition.content.push({text: this.strip(model.notice), italics: true, alignment: 'justify'});
    docDefinition.info = new PdfMetadata(model.name);

    let description = 'none';
    if (model.name === 'Survey on National Contributions to EOSC 2022' || model.id === 'm-eosc-sb-2023') {
      description = 'end'
    }
    this.createDocumentDefinition(model, payload, form, docDefinition, description);

    pdfMake.createPdf(docDefinition).download(model.name);
  }

  documentDefinitionRecursion(model: Model, fields: Field[], payload, form: FormGroup, docDefinition: DocDefinition, description: string, descriptionAtEnd?: DocDefinition) {
    for (const field of fields) {
      if (field.deprecated)
        continue;
      if (field.label.text)
        docDefinition.content.push(new Content(field.label.text, ['mx_3']));
      if (field.form.description.text
        && !field.form.description.text.includes('Please add only new use cases as any use cases submitted in the previous survey will be imported here')
        && !field.form.description.text.includes('For example on curricula for data stewardship')) {

        if (description === 'end') {
          let questionNumber = null;
          if (field.label.text) {
            questionNumber = field.label.text.split('. ')[0];
          }
          // let term = field.form.description.text.split('-')[0]
          // console.log(this.strip(field.form.description.text));

          if (model.id === 'm-eosc-sb-2023') {
            let strArray = [];
            if (this.strip(field.form.description.text).includes('Instructions')) {
              if (this.strip(field.form.description.text).includes('Glossary'))
                strArray[0] = this.string_between_strings('Instructions', 'Glossary', this.strip(field.form.description.text));
              else
                strArray[0] = this.strip(field.form.description.text).split('Instructions')[1];
              // console.log(this.strip(field.form.description.text));
            }
            if (field.form.description.text.split('Glossary').length > 1)
              strArray[1] = field.form.description.text.split('Glossary')[1];

            let content = {
              style: ['mt_3'],
              text: []
            }
            content.text.push({text: questionNumber+' '});
            let terms = strArray[1]?.split('<br><br>')
            if (terms?.length > 0) {
              for (let i = 0; i < terms.length; i++) {
                content.text.push({text:  this.strip(terms[i].split(':')[0])+': ', bold: true});
                content.text.push({text:  this.strip(terms[i].split(':')[1]).concat('\n')});
              }
            }
            content.text.push({text:  strArray[0] ? 'Instructions' : '', bold: true});
            content.text.push({text: strArray[0] ? ' - '+strArray[0] : ''});


            // descriptionAtEnd.content.push(new Content(questionNumber + ' ' + components.shift() + '-' + components.join('-'), ['mt_3']));
            if (strArray.length)
              descriptionAtEnd.content.push(content);

          } else {
            let components = this.strip(field.form.description.text).split(' - ');
            let content = {
              style: ['mt_3'],
              text: [
                questionNumber,
                ' ',
                {text:  components.shift(), bold: true},
                ' - ',
                components.join('-')
              ]
            }
            // descriptionAtEnd.content.push(new Content(questionNumber + ' ' + components.shift() + '-' + components.join('-'), ['mt_3']));
            descriptionAtEnd.content.push(content);
          }

        }
        if (description === 'show')
          docDefinition.content.push(new Content(field.form.description.text, ['mt_3']));
      }
      // console.log(field.name);
      let formControl = this.findControlByName(form, field.name);
      // console.log(formControl);
      let answerValues = this.findVal(payload, field.name);
      // console.log(answerValues);
      if (field.typeInfo.type === 'radio') {
        let values = field.typeInfo.values
        // if (field.kind === 'conceal-reveal')
        //   values = this.getModelData(this.model.sections, field.parent).typeInfo.values;
        for (const value of values) {
          let content = new Columns();
          if (value === answerValues?.[0]){
            content.columns.push(new PdfImage('radioChecked', 10, 10, ['marginTopCheckBox']));
          }
          else {
            content.columns.push(new PdfImage('radioUnchecked', 10, 10, ['marginTopCheckBox']));
          }
          content.columns.push(new Content(value,['ms_1', 'mt_1']));
          docDefinition.content.push(content);
        }
      } else if (field.typeInfo.type === 'checkbox') {
        docDefinition.content.pop();
        let content = new Columns(['mx_1']);
        if (answerValues?.[0]) {
          content.columns.push(new PdfImage('checked', 10, 10, ['mt_1']));
        } else {
          content.columns.push(new PdfImage('unchecked', 10, 10, ['mt_1']));
        }
        content.columns.push(new Content(field.label.text,['ms_1']));
        docDefinition.content.push(content);
      } else if (field.typeInfo.type === 'largeText' || field.typeInfo.type === 'richText') {
        if (answerValues?.[0] && answerValues?.[0]?.trim() !== '') {
          docDefinition.content.push(new PdfTable(new TableDefinition([[this.strip(answerValues[0])]], ['*']), ['mt_1']));
        } else {
          docDefinition.content.push(new PdfTable(new TableDefinition([['']],['*'], [48]), ['mt_1']));
        }
      } else if (answerValues && field.typeInfo.type !== 'composite') {

        if (answerValues?.[0] instanceof Array && answerValues[0].length === 1 && answerValues[0]?.[0] === null)
          answerValues[0] = null;

        if (answerValues?.[0]) {
          docDefinition.content.push(new PdfTable(new TableDefinition([[answerValues[0]]], ['*']), ['mt_1']));
        } else if (field.form.placeholder) {
          docDefinition.content.push(new PdfTable(new TableDefinition([[{text: field.form.placeholder, color: 'gray'}]],['*']), ['mt_1']));
        } else {
          docDefinition.content.push(new PdfTable(new TableDefinition([['']],['*'], [16]), ['mt_1']));
        }
      } else if (field.kind === 'external' && field.typeInfo.type === 'composite') {
        docDefinition.content.push(new PdfTable(new TableDefinition([[{text: field.form.description, color: 'gray'}]],['*']), ['mt_1']));
        continue;
      }
      if (field.subFields) {
        if (field.typeInfo.type === 'composite' && field.typeInfo.multiplicity) {
          const tmpCtrl = cloneDeep(formControl.getRawValue());
          if (tmpCtrl instanceof Array) {
            for (let i = 0; i < tmpCtrl.length; i++) {
              this.documentDefinitionRecursion(model, field.subFields, tmpCtrl[i], form, docDefinition, description, descriptionAtEnd);
            }
          }

        } else
          this.documentDefinitionRecursion(model, field.subFields, payload, form, docDefinition, description, descriptionAtEnd);
      }
    }
  }

  createDocumentDefinition(model: Model, payload, form: FormGroup, docDefinition: DocDefinition, description: string) {
    let descriptionsAtEnd = new DocDefinition();

    if (model.name === 'Survey on National Contributions to EOSC 2022'  || model.id === 'm-eosc-sb-2023') {
      docDefinition.content.push(new Content('Definitions of key terms can be found in Appendix A', ['mt_3']));
    }

    model.sections.sort((a, b) => a.order - b.order);
    for (const section of model.sections) {
      section.subSections.sort((a, b) => a.order - b.order);
      if (model.sections.length > 1) {
        docDefinition.content.push(new Content(section.name, ['chapterHeader']));
      }

      for (const subSection of section.subSections) {
        if (section.subSections.length > 1) {
          docDefinition.content.push(new Content(subSection.name, ['tabHeader']));
        }
        if (subSection.fields)
          this.documentDefinitionRecursion(model, subSection.fields, payload, form, docDefinition, description, descriptionsAtEnd);
      }

    }

    if (model.name === 'Survey on National Contributions to EOSC 2022' || model.id === 'm-eosc-sb-2023') {

      docDefinition.content.push(new Content('Appendix A', ['title']));
      docDefinition.content.push(...descriptionsAtEnd.content);

      docDefinition.content.push(new Content('Appendix B', ['title']));
      let content = [
        {
          style: ['mt_3'],
          text: ['Visit the ',
            {text: 'EOSC Observatory', link: 'https://eoscobservatory.eosc-portal.eu', color: 'cornflowerblue', decoration: 'underline'},
            ' to explore the data from the EOSC Steering Board surveys on National Contributions to EOSC and visit the ',
            {text: 'EOSC Observatory Zenodo Community', link: 'https://zenodo.org/communities/eoscobservatory', color: 'cornflowerblue', decoration: 'underline'},
            ' to access all key outputs related to the surveys and EOSC Observatory.']
        }
      ]
      docDefinition.content.push(content);
    }

    return;

  }

  private findControlByName(control: AbstractControl, name: string): AbstractControl | null {
    if (control.get(name)) {
      return control.get(name);
    }

    for (const key in control['controls']) {
      const nestedControl = control.get(key);
      if (nestedControl instanceof FormGroup || nestedControl instanceof FormArray) {
        const foundControl = this.findControlByName(nestedControl, name);
        if (foundControl) {
          return foundControl;
        }
      }
    }

    return null;
  }

  findVal(obj: any, key: string) {
    if (!obj)
      return null;

    // console.log(obj);
    let seen = new Set, active = [obj];
    while (active.length) {
      let new_active = [], found = [];
      for (let i=0; i < active.length; i++) {
        Object.keys(active[i]).forEach(function(k){
          let x = active[i][k];
          if (k === key) {
            if (x?.hasOwnProperty('text'))
              found.push(x.text)
            else
              found.push(x);
          } else if (x && typeof x === "object" && !seen.has(x)) {
            seen.add(x);
            new_active.push(x);
          }
        });
      }
      if (found.length) return found;
      active = new_active;
    }
    return null;
  }

  strip(html: string){
    let doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  }

  string_between_strings(startStr: string, endStr: any, str: string) {
    let pos = str.indexOf(startStr) + startStr.length;
    return str.substring(pos, str.indexOf(endStr, pos));
  }
}
