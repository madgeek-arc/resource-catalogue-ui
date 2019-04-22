import {Indicator} from './eic-model';
import {Measurement} from './eic-model';
import {Facet} from './facet';


export class MeasurementsPage {
  total: number;
  from: number;
  to: number;
  results: Measurement[];
  facets: Facet[];
}

export class IndicatorsPage {
  total: number;
  from: number;
  to: number;
  results: Indicator[];
  facets: Facet[];
}
