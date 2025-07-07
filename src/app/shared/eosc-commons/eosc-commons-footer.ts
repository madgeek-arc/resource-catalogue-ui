import { Component, OnInit, ElementRef } from '@angular/core';

@Component({
  selector: 'app-external-footer',
  template: `<div class="commons-footer"></div>`,
})
export class ExternalFooterComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {
    // Call external theme's rendering function for footer
    window['eosccommon']?.renderMainFooter?.('.commons-footer');
  }
}
