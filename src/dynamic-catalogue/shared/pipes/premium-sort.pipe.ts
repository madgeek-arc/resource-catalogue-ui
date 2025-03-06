import {Pipe, PipeTransform} from '@angular/core';
import {Facet, FacetValue} from '../../domain/facet';

@Pipe({name: 'premiumSort'})
export class PremiumSortPipe implements PipeTransform {
  transform(arr: any[], weights: string[]): any {
    const ret = (arr || []).sort((a, b): number => {
      let val = 0;
      const weightA = weights.indexOf(a.name);
      const weightB = weights.indexOf(b.name);
      if (weightA !== -1 && weightB !== -1) {
        val = weightA - weightB;
      } else if (weightA !== -1) {
        val = -1;
      } else if (weightB !== -1) {
        val = 1;
      } else {
        val = a.name.localeCompare(b.name);
      }
      return val;
    });
    return ret;
  }
}

@Pipe({name: 'premiumSortFacets'})
export class PremiumSortFacetsPipe implements PipeTransform {
  transform(arr: Facet[], weights: string[]): any {
    const ret = (arr || []).sort((a, b): number => {
      let val = 0;
      const weightA = weights.indexOf(a.label);
      const weightB = weights.indexOf(b.label);
      if (weightA !== -1 && weightB !== -1) {
        val = weightA - weightB;
      } else if (weightA !== -1) {
        val = -1;
      } else if (weightB !== -1) {
        val = 1;
      } else {
        val = a.label.localeCompare(b.label);
      }
      return val;
    });
    return ret;
  }
}

@Pipe({name: 'premiumSortFacetValues'})
export class PremiumSortFacetValuesPipe implements PipeTransform {
  transform(arr: FacetValue[], weights: string[]): any {
    const ret = (arr || []).sort((a, b): number => {
      let val = 0;
      const weightA = weights.indexOf(a.label);
      const weightB = weights.indexOf(b.label);
      if (weightA !== -1 && weightB !== -1) {
        val = weightA - weightB;
      } else if (weightA !== -1) {
        val = -1;
      } else if (weightB !== -1) {
        val = 1;
      } else {
        val = a.label.localeCompare(b.label);
      }
      return val;
    });
    return ret;
  }
}
