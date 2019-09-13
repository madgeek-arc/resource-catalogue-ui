import {Component, OnInit} from '@angular/core';
import {ResourceService} from '../../../../../../src/app/services/resource.service';
import {NestedVocabulary} from '../../../../../../src/app/domain/eic-model';

@Component({
  selector: 'app-browse-subcategories',
  templateUrl: './browse-subcategories.component.html'
})
export class BrowseSubcategoriesComponent implements OnInit {
  public errorMessage: string;
  public nestedStructure: NestedVocabulary;

  constructor(private resourceService: ResourceService) {}

  ngOnInit(): void {
    this.resourceService.getNestedVocabulariesByType('SUPERCATEGORY').subscribe(
      res => this.nestedStructure = res,
      error => console.log(error)
    );
  }
}
