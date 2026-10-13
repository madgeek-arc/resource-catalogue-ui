/**
 * Created by stefania on 05/06/2018.
 */
import {Component, DestroyRef, OnInit} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ActivatedRoute, NavigationEnd, Params, PRIMARY_OUTLET, Router} from '@angular/router';
import {NavigationService} from '../../services/navigation.service';
import {filter} from 'rxjs/operators';


interface IBreadcrumb {
  label: string;
  params: Params | undefined;
  url: string;
  navigable: boolean;
}

@Component({
    selector: 'app-breadcrumbs',
    templateUrl: './breadcrumbs.component.html',
    standalone: false
})
export class BreadcrumbsComponent implements OnInit {

  public breadcrumbs: IBreadcrumb[];
  public goBack = false;
  readonly ROUTE_DATA_BREADCRUMB: string = 'breadcrumb';

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private navigation: NavigationService,
    private destroyRef: DestroyRef
  ) {
    this.breadcrumbs = [];
  }

  /**
   *
   * @method ngOnInit
   */
  ngOnInit() {
    // subscribe to the NavigationEnd event
    this.handleEvent({});
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(event => this.handleEvent(event));
    this.navigation.breadcrumbs.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(service => {
      this.breadcrumbs[this.breadcrumbs.length - 1].label = service;
    });
  }

  private handleEvent(event: any) {
    const root: ActivatedRoute = this.activatedRoute.root;
    const breadcrumbs = [];
    const breadcrumb: IBreadcrumb = {
      label: 'Home',
      params: {},
      url: '/home',
      navigable: true
    };
    breadcrumbs.push(breadcrumb);
    this.breadcrumbs = this.getBreadcrumbs(root, '', breadcrumbs);
    this.goBack = !!this.breadcrumbs.find(v => v.label === 'Compare');
  }

  /**
   * Returns array of IBreadcrumb objects that represent the breadcrumb
   *
   * @method getBreadcrumbs
   */
  private getBreadcrumbs(route: ActivatedRoute, url: string = '', breadcrumbs: IBreadcrumb[] = []): IBreadcrumb[] {
    const ROUTE_DATA_BREADCRUMB = 'breadcrumb';

    // get the child routes
    const children: ActivatedRoute[] = route.children;
    // return if there are no more children
    if (children.length === 0) {
      return breadcrumbs;
    }

    // iterate over each children
    for (const child of children) {
      // verify primary route
      if (child.outlet !== PRIMARY_OUTLET) {
        continue;
      }

      // verify the custom data property "breadcrumb" is specified on the route
      if (!child.snapshot.data.hasOwnProperty(ROUTE_DATA_BREADCRUMB)) {
        return this.getBreadcrumbs(child, url, breadcrumbs);
      }

      // get the route's URL segment
      const routeURL: string = child.snapshot.url.map(segment => segment.path).join('/');
      // append route URL to URL
      url += `/${routeURL}`;

      // add breadcrumb
      const breadcrumb: IBreadcrumb = {
        label: child.snapshot.data[ROUTE_DATA_BREADCRUMB],
        params: undefined,
        url: this.stripMatrixParams(url),
        navigable: child.snapshot.data['breadcrumbNavigable'] !== false
      };
      if (breadcrumb.label !== '') {
        breadcrumbs.push(breadcrumb);
      }

      // recursive
      return this.getBreadcrumbs(child, url, breadcrumbs);
    }
  }

  private stripMatrixParams(path: string): string {
    return path
      .split('/')
      .map(segment => segment.split(';')[0])
      .join('/');
  }
}
