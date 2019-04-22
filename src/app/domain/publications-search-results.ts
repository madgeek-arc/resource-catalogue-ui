/**
 * Created by stefania on 11/24/16.
 */
import {Facet} from "./facet";

export class PublicationSearchResults {
    from: number;
    to: number;
    totalHits: number;
    publications: any;
    facets: Facet[];
}