import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {environment} from '../../../../environments/environment';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['../developers/developers.component.css']
})
export class AboutComponent implements OnInit {

  constructor(private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.route.fragment.subscribe(fragment => this.scrollTo('#' + fragment));
  }

  scrollTo(selector: string) {
    const element = document.querySelector(selector);
    if (element) {
      // element.scrollIntoView(element);
      // element.scrollIntoView();
      element.scrollIntoView({behavior: 'smooth', block: 'end', inline: 'nearest'});
    }
  }
}
