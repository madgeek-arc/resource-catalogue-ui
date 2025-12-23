import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-readonly-resource-info',
  templateUrl: './readonly-resource-info.component.html'
})
export class ReadonlyResourceInfoComponent {

  @Input() model!: any;   // form model
  @Input() data!: any;    // resource data (catalogue or provider)
  @Input() vocs: any;

  getTabs() {
    return this.model?.sections?.[0]?.subSections ?? [];
  }

  valueOf(field: any, obj: any) {
    return obj?.[field.name];
  }

  isComposite(field: any) {
    return field.typeInfo?.type === 'composite';
  }

  isMultiple(field: any) {
    return !!field.typeInfo?.multiplicity;
  }

  isVisible(field: any) {
    return field.form?.display?.visible !== false;
  }

  displayVocValue(field: any, value: any): string {
    if (value == null) {
      return '—';
    }

    const vocabKey = field.typeInfo?.vocabulary;
    if (!vocabKey || !this.vocs?.[vocabKey]) {
      return value;
    }

    const vocab = this.vocs[vocabKey];

    // multiple selection
    if (Array.isArray(value)) {
      return value
        .map(v => vocab.find(x => x.id === v)?.name || v)
        .join(', ');
    }

    // single selection
    return vocab.find(x => x.id === value)?.name || value;
  }
}
