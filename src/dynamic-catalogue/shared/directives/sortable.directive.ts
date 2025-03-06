import { AfterViewInit, Directive, ElementRef, EventEmitter, Output } from '@angular/core';
import UIkit from 'uikit';
import Icons from 'uikit/dist/js/uikit-icons';

UIkit.use(Icons);

interface PositionChange {
  oldIndex: number;
  newIndex: number;
  element: HTMLElement;
}

@Directive({
  selector: '[appSortable]'
})
export class SortableDirective implements AfterViewInit {
  @Output() positionChanged = new EventEmitter<PositionChange>();

  constructor(private el: ElementRef) {}

  ngAfterViewInit(): void {
    const container = this.el.nativeElement as HTMLElement;

    UIkit.sortable(container, {'cls-custom': '', handle: '.uk-sortable-handle'});
    container.addEventListener('moved', (event: any) => {
      event.stopPropagation(); // Prevent the event from propagating to the outer container

      const items = Array.from(container.children);
      const movedItem: HTMLElement = event.detail[1]; // The moved element
      const newIndex = items.indexOf(movedItem);
      const oldIndex = parseInt(movedItem.getAttribute('data-index')!, 10);

      this.positionChanged.emit({ oldIndex, newIndex, element: movedItem });

      // Update data-index attributes to reflect the new order
      items.forEach((item, index) => {
        item.setAttribute('data-index', index.toString());
      });
    });
  }
}


