import { NgModule } from "@angular/core";
import { PremiumSortFacetsPipe, PremiumSortFacetValuesPipe, PremiumSortPipe } from "./pipes/premium-sort.pipe";
import { SafeUrlPipe } from "./pipes/safeUrlPipe";
import { UniquePipe } from "./pipes/uniquePipe.pipe";
import { SortableDirective } from "./directives/sortable.directive";

@NgModule({
  declarations: [
    PremiumSortPipe,
    PremiumSortFacetsPipe,
    PremiumSortFacetValuesPipe,
    SafeUrlPipe,
    UniquePipe,
    SortableDirective
  ],
  imports: [],
  exports: [
    PremiumSortPipe,
    PremiumSortFacetsPipe,
    PremiumSortFacetValuesPipe,
    SafeUrlPipe,
    UniquePipe,
    SortableDirective
  ]
})

export class CatalogueUiSharedModule { }
