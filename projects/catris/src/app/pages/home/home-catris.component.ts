import {Component, OnInit} from '@angular/core';
import {HomeComponent} from '../../../../../../src/app/pages/home/home.component';



@Component({
  selector: 'app-home-catris',
  templateUrl: './home-catris.component.html',
  styleUrls: ['./home-catris.component.css']
})
export class HomeCatrisComponent extends HomeComponent implements OnInit {

  getSubcategoriesIds(parent: string, type: string) {
    let idsArray: string[];
    this.resourceService.getSubcategoriesIdsFromSuperCategory(parent, type).subscribe(
      res => idsArray = res,
      error => console.log(error),
      () => {
        if (type === 'SCIENTIFIC_DOMAIN') {
          return this.router.search({scientific_subdomains: idsArray});
        } else {
          return this.router.search({subcategories: idsArray});
        }
      }
    );
  }
}

