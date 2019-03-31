
import {Injectable} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';

@Injectable()
export class NavigationService {

    private searchParams: Subject<any> = new Subject();

    private breadcrumbs_: Subject<any> = new Subject<any>();

    constructor(public router: Router) {
    }

    service(id: string) {
        return this.router.navigate(['/service', id]);
    }

    dashboard(provider: string, id: string) {
        return this.router.navigate([`/dashboard/${provider}`, id]);
    }

    edit(id: string) {
        return this.router.navigate(['/edit', id]);
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
