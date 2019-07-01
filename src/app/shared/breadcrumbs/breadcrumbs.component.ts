/**
 * Created by stefania on 05/06/2018.
 */
import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Params, PRIMARY_OUTLET, Router} from '@angular/router';
import {NavigationService} from '../../services/navigation.service';
import {filter} from 'rxjs/operators';


interface IBreadcrumb {
  label: string;
  params: Params;
  url: string;
}

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.css'],
})
export class BreadcrumbsComponent implements OnInit {

  public breadcrumbs: IBreadcrumb[];
  public goBack = false;
  readonly ROUTE_DATA_BREADCRUMB: string = 'breadcrumb';

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private navigation: NavigationService
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
      filter(event => event instanceof NavigationEnd)
    ).subscribe(event => this.handleEvent(event));
    this.navigation.breadcrumbs.subscribe(service => {
      this.breadcrumbs[this.breadcrumbs.length - 1].label = service;
    });
  }

  private handleEvent(event: any) {
    const root: ActivatedRoute = this.activatedRoute.root;
    const breadcrumbs = [];
    const breadcrumb: IBreadcrumb = {
      label: 'Home',
      params: {},
      url: '/home'
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
    // console.log(children, url, breadcrumbs);
    // return if there are no more children
    if (children.length === 0) {
      return breadcrumbs;
    }

    // iterate over each children
    for (const child of children) {
      // console.log('children', child);
      // verify primary route
      if (child.outlet !== PRIMARY_OUTLET) {
        continue;
      }

      // verify the custom data property "breadcrumb" is specified on the route
      if (!child.snapshot.data.hasOwnProperty(ROUTE_DATA_BREADCRUMB)) {
        return this.getBreadcrumbs(child, url, breadcrumbs);
      } else {
        // console.log('if', child.snapshot);
      }

      // get the route's URL segment
      // console.log(child.snapshot.url);
      const routeURL: string = child.snapshot.url.map(segment => segment.path).join('/');
      // let routeURL: string = child.snapshot.url[0].path;
      // append route URL to URL
      url += `/${routeURL}`;

      // add breadcrumb
      const breadcrumb: IBreadcrumb = {
        label: child.snapshot.data[ROUTE_DATA_BREADCRUMB],
        params: child.snapshot.params,
        url: url
      };
      // console.log(breadcrumb);
      if (breadcrumb.label !== '') {
        breadcrumbs.push(breadcrumb);
      }

      // recursive
      return this.getBreadcrumbs(child, url, breadcrumbs);
    }
  }
}
