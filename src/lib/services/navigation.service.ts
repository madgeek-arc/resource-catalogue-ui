import {Injectable} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';

@Injectable()
export class NavigationService {

    public searchParams: Subject<any> = new Subject();

    private breadcrumbs_: Subject<any> = new Subject<any>();

    constructor(public router: Router) {
    }

    service(id: string) {
        return this.router.navigate(['/service', id]);
    }

    dashboard(id: string, catalogueId?: string) {
      if(!catalogueId) return this.router.navigate([`/dashboard/eosc`, id]);
        return this.router.navigate([`/dashboard`, id]);
    }

    dashboardDatasources(providerId: string, catalogueId?: string) {
      if (!catalogueId) return this.router.navigate([`/dashboard/eosc/${providerId}/datasources`]);
      return this.router.navigate([`/dashboard/${catalogueId}/${providerId}/datasources`]);
    }

    dashboardResources(providerId: string) {
      return this.router.navigate([`/dashboard/${providerId}/resources`]);
    }

    dashboardDraftResources(providerId: string) {
      return this.router.navigate([`/dashboard/${providerId}/draft-resources`]);
    }

    resourceDashboard(providerId: string, serviceId: string, catalogueId?: string) {
      if(!catalogueId) return this.router.navigate([`/dashboard/eosc/${providerId}/resource-dashboard/${serviceId}/stats`]);
      return this.router.navigate([`/dashboard/${providerId}/resource-dashboard/${serviceId}/stats`]);
    }

    datasourceDashboard(providerId: string, datasourceId: string, catalogueId?: string) {
      if(!catalogueId) return this.router.navigate([`/dashboard/eosc/${providerId}/datasource-dashboard/${datasourceId}/stats`]);
      return this.router.navigate([`/dashboard/${providerId}/datasource-dashboard/${datasourceId}/stats`]);
    }

    trainingResourceDashboard(providerId: string, trainingResourceId: string, catalogueId?: string) {
      if(!catalogueId) return this.router.navigate([`/dashboard/eosc/${providerId}/training-resource-dashboard/${trainingResourceId}/stats`]);
      return this.router.navigate([`/dashboard/${providerId}/training-resource-dashboard/${trainingResourceId}/stats`]);
    }

    edit(id: string) {
        return this.router.navigateByUrl(`/provider/${id.split('.')[0]}/resource/update/${id}`);
    }

    editAIRE(id: string) {
      return this.router.navigate(['/provider/openaire/resource/update', id]);
    }

    datasourceSubmitted(id: string) {
      return this.router.navigate(['datasource/submitted', id]);
    }

    search(any: any) {
        return this.router.navigate(['/search', any]);
    }

    resourcesList(any: any) {
      return this.router.navigate(['/provider/resource/all', any]);
    }

    /*login() {
        return this.router.navigate(["/signIn"]);
    }*/

    home() {
        return this.router.navigate(['/home']);
    }

    compare(any: any) {
        return this.router.navigate(['/compare', any]);
    }

    go(url: string) {
        return this.router.navigate([url]);
    }

    goOffsite(url: string) {
        window.location.href = url;
    }

    public get paramsObservable() {
        return this.searchParams;
    }

    public get breadcrumbs() {
        return this.breadcrumbs_.asObservable();
    }

    public set breadcrumbs(breadcrumb: any) {
        this.breadcrumbs_.next(breadcrumb);
    }
}
