import {Component, OnInit} from '@angular/core';
import {ResourceService} from '../../../../../../src/app/services/resource.service';
import {VocabularyTree} from '../../../../../../src/app/domain/eic-model';
import {NavigationService} from '../../../../../../src/app/services/navigation.service';

@Component({
  selector: 'app-browse-subcategories',
  templateUrl: './browse-subcategories.component.html'
})
export class BrowseSubcategoriesComponent implements OnInit {
  public errorMessage: string;
  public nestedStructure: VocabularyTree;

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

  getSubcategoriesIds(parent: string, type: string) {
    let idsArray: string[];
    this.resourceService.getSubcategoriesIdsFromSuperCategory(parent, type).subscribe(
      res => idsArray = res,
      error => console.log(error),
      () => {
        return this.router.search({subcategories: idsArray});
      }
    );
  }
}
