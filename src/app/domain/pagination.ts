import {Facet} from './facet';

export class Pagination<T> {

  from: number;
  to: number;
  total: number;

  results: T[];
  facets: Facet[];
}
