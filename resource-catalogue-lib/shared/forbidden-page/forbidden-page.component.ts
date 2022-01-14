import { Component, OnInit } from '@angular/core';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-forbidden-page',
  templateUrl: './forbidden-page.component.html',
  styleUrls: ['./forbidden-page.component.css']
})
export class ForbiddenPageComponent implements OnInit {

  projectName = environment.projectName;
  serviceORresource = environment.serviceORresource;

  constructor() { }

  ngOnInit() {
  }

}
