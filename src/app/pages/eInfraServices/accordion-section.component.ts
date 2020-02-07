import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';

@Component({
  selector: '[accordionSection]',
  template: `
    <h3 class="uk-accordion-title" [ngClass]="{'uk-alert-danger': error}">
      <span>
          <!--<i class="fa fa" [ngClass]="valid ? 'fa-check':'fa-exclamation'" aria-hidden="true"></i>-->
        {{title}}
        <!--<i class="fa" [ngClass]="{'fa-angle-down': !group1?._isOpen, 'fa-angle-up': group1?._isOpen}" aria-hidden="true"></i>-->
      </span>
    </h3>
    <div class="uk-accordion-content">
      <ng-content></ng-content>
    </div>
  `
})

export class AccordionComponent {

  @Input() title = '';
  @Input() error = false;

}
