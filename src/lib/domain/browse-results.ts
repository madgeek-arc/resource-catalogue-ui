/**
 * Created by stefania on 8/4/17.
 */
import {Service} from './eic-model';

export class BrowseResults {
    data: { [key: string]: Service[] };

    constructor() {
        this.data = {};
    }
}
