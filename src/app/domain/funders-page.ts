import {Funder, Provider} from './eic-model';
import {Facet} from './facet';


export class FundersPage {
    total: number;
    from: number;
    to: number;
    results: Funder[];
    facets: Facet[];

}

export class ProvidersPage {
  total: number;
  from: number;
  to: number;
  results: Provider[];
  facets: Facet[];
}
