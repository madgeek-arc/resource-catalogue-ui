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

    dashboard(id: string) {
        return this.router.navigate([`/dashboard`, id]);
    }

    dashboardResources(providerId: string) {
      return this.router.navigate([`/dashboard/${providerId}/resources`]);
    }

    dashboardDraftResources(providerId: string) {
      return this.router.navigate([`/dashboard/${providerId}/draft-resources`]);
    }

    resourceDashboard(providerId: string, serviceId: string) {
      return this.router.navigate([`/resource-dashboard/${providerId}/${serviceId}/stats`]);
    }

    edit(id: string) {
        return this.router.navigate(['/edit', id]);
    }

    editAIRE(id: string) {
      return this.router.navigate(['/provider/openaire/resource/update', id]);
    }

    search(any: any) {
        return this.router.navigate(['/search', any]);
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
