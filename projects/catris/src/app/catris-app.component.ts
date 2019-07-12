import { Component } from '@angular/core';
import {AppComponent} from '../../../../src/app/app.component';

@Component({
  selector: 'app-root',
  templateUrl: './catris-app.component.html',
})
export class CatrisAppComponent extends AppComponent {
  title = 'catris';

  private scrollToTop() {
    window.scrollTo(0, 0);
  }
}
