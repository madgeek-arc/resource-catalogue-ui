import {Injectable} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import {pidHandler} from "../shared/pid-handler/pid-handler.service";

@Injectable()
export class NavigationService {

    public searchParams: Subject<any> = new Subject();

    private breadcrumbs_: Subject<any> = new Subject<any>();

    constructor(public router: Router,
                public pidHandler: pidHandler) {
    }


    createId(route: ActivatedRoute, prefix: string, suffix: string) {
      // console.log(route.snapshot);
      if (!route.snapshot.paramMap.get(prefix) || !route.snapshot.paramMap.get(suffix)) return null;
      return route.snapshot.paramMap.get(prefix) + '/' + route.snapshot.paramMap.get(suffix);
    }

    service(id: string) {
      id = this.pidHandler.customEncodeURIComponent(id);
        return this.router.navigate(['/service', id]);
    }

    dashboard(id: string, catalogueId?: string) {
      id = this.pidHandler.customEncodeURIComponent(id);
      if(!catalogueId) return this.router.navigate([`/dashboard/eosc`, id]);
        return this.router.navigate([`/dashboard`, id]);
    }

    dashboardDatasources(providerId: string, catalogueId?: string) {
      providerId = this.pidHandler.customEncodeURIComponent(providerId);
      if (!catalogueId) return this.router.navigate([`/dashboard/eosc/${providerId}/datasources`]);
      return this.router.navigate([`/dashboard/${catalogueId}/${providerId}/datasources`]);
    }

    dashboardResources(providerId: string, catalogueId?: string) {
      providerId = this.pidHandler.customEncodeURIComponent(providerId);
      if (!catalogueId) return this.router.navigate([`/dashboard/eosc/${providerId}/resources`]);
      return this.router.navigate([`/dashboard/${catalogueId}/${providerId}/resources`]);
    }

    dashboardDraftResources(providerId: string) {
      providerId = this.pidHandler.customEncodeURIComponent(providerId);
      return this.router.navigate([`/dashboard/${providerId}/draft-resources`]);
    }

    resourceDashboard(providerId: string, serviceId: string, catalogueId?: string) {
      providerId = this.pidHandler.customEncodeURIComponent(providerId);
      serviceId = this.pidHandler.customEncodeURIComponent(serviceId);
      if(!catalogueId) return this.router.navigate([`/dashboard/eosc/${providerId}/resource-dashboard/${serviceId}/history`]);
      return this.router.navigate([`/dashboard/${providerId}/resource-dashboard/${serviceId}/history`]);
    }

    datasourceDashboard(providerId: string, datasourceId: string, catalogueId?: string) {
      providerId = this.pidHandler.customEncodeURIComponent(providerId);
      datasourceId = this.pidHandler.customEncodeURIComponent(datasourceId);
      if(!catalogueId) return this.router.navigate([`/dashboard/eosc/${providerId}/datasource-dashboard/${datasourceId}/history`]);
      return this.router.navigate([`/dashboard/${providerId}/datasource-dashboard/${datasourceId}/history`]);
    }

    trainingResourceDashboard(providerId: string, trainingResourceId: string, catalogueId?: string) {
      providerId = this.pidHandler.customEncodeURIComponent(providerId);
      trainingResourceId = this.pidHandler.customEncodeURIComponent(trainingResourceId);
      if(!catalogueId) return this.router.navigate([`/dashboard/eosc/${providerId}/training-resource-dashboard/${trainingResourceId}/history`]);
      return this.router.navigate([`/dashboard/${providerId}/training-resource-dashboard/${trainingResourceId}/history`]);
    }

    // edit(id: string) {
    //   id = pidHandler.customEncodeURIComponent(id);
    //     return this.router.navigateByUrl(`/provider/${id.split('.')[0]}/resource/update/${id}`);
    // }

    // editAIRE(id: string) {
    //   id = pidHandler.customEncodeURIComponent(id);
    //   return this.router.navigate(['/provider/openaire/resource/update', id]);
    // }

    selectSubprofile(providerId: string, serviceId :string){
      providerId = this.pidHandler.customEncodeURIComponent(providerId);
      serviceId = this.pidHandler.customEncodeURIComponent(serviceId);
      return this.router.navigate([`/provider/${providerId}/service/${serviceId}/select-subprofile`]);
    }

    datasourceSubmitted(id: string) {
      id = this.pidHandler.customEncodeURIComponent(id);
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
