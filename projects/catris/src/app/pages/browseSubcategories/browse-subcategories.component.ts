import {Component, OnInit} from '@angular/core';
import {ResourceService} from '../../../../../../src/app/services/resource.service';
import {NestedVocabulary} from '../../../../../../src/app/domain/eic-model';
import {NavigationService} from '../../../../../../src/app/services/navigation.service';

@Component({
  selector: 'app-browse-subcategories',
  templateUrl: './browse-subcategories.component.html'
})
export class BrowseSubcategoriesComponent implements OnInit {
  public errorMessage: string;
  public nestedStructure: NestedVocabulary;

  constructor(private resourceService: ResourceService,
              public router: NavigationService) {}

  ngOnInit(): void {
    this.resourceService.getNestedVocabulariesByType('SUPERCATEGORY').subscribe(
      res => {
        this.nestedStructure = res;
        this.nestedStructure.children.sort((a, b) => 0 - (a.vocabulary.name > b.vocabulary.name ? -1 : 1));
      },
      error => console.log(error)
    );
  }
}
