import {Component, OnInit} from '@angular/core';
import {NavigationService} from '../../services/navigation.service';
import {ResourceService} from '../../services/resource.service';
import {BrowseResults} from '../../domain/browse-results';
import {Service} from '../../domain/eic-model';

@Component({
    selector: 'app-browse-categories',
    templateUrl: './browse-categories.component.html',
    styleUrls: ['./browse-categories.component.css']
})
export class BrowseCategoriesComponent implements OnInit {
    public browseResults: BrowseResults;
    public errorMessage: string;
    public browseResultsColumns: BrowseResults[] = [];

    constructor(public router: NavigationService, public resourceService: ResourceService) {
    }

    ngOnInit() {
        this.resourceService.getServicesByCategories()
        .subscribe(browseResults => this.updateBrowseResults(browseResults));
    }

    updateBrowseResults(browseResults: BrowseResults) {
        this.browseResults = browseResults;
        let noOfServices = 0;
        const keys = Object.keys(this.browseResults);
        keys.sort(function(a, b) {if (a.toLowerCase() < b.toLowerCase()) { return -1; } else { return 1; }});
        for (const key of keys) {
            const services: Service[] = this.browseResults[key];
            noOfServices += services.length;
        }
        const servicesPerColumn: number = noOfServices / 3;
        let counter = 0;
        let columnIndex = 0;
        this.browseResultsColumns.push(new BrowseResults());
        for (const key of keys) {
            const services: Service[] = this.browseResults[key];
            counter += services.length;
            services.sort(function(a, b) {if (a.name.toLowerCase() < b.name.toLowerCase()) { return -1; } else { return 1; }});
            this.browseResultsColumns[columnIndex].data[key] = (services);
            if (counter > servicesPerColumn) {
                columnIndex++;
                counter = 0;
                this.browseResultsColumns.push(new BrowseResults());
            }
        }
    }
}
