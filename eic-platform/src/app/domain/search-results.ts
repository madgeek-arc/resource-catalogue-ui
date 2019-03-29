/**
 * Created by stefania on 9/9/16.
 */
import { Facet } from "./facet";

export class SearchResults<T> {

    from: number;
    to: number;
    total: number;

    results: T[];
    facets: Facet[];
}