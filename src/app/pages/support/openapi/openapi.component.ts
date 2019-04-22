import {Component} from '@angular/core';
import {environment} from '../../../../environments/environment';

@Component({
  selector: 'app-openapi',
  templateUrl: './openapi.component.html',
  styleUrls: ['./openapi.component.css']
})
export class OpenAPIComponent {
  private url = environment.API_ENDPOINT;

  // use this for now
  getUI() {
    return `${this.url}/swagger-ui.html`;
  }

  // this needs consuming code/libraries; too much effort, not agile enough
  getJSON() {
    return `${this.url}/v2/api-docs`;
  }
}
