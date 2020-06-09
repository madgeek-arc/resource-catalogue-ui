import {Provider} from './eic-model';
import {Facet} from './facet';


export class ProvidersPage {
  total: number;
  from: number;
  to: number;
  results: Provider[];
  facets: Facet[];
}
