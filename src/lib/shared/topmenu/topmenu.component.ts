import {
  Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild, ViewEncapsulation
} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormGroup} from '@angular/forms';
import {AuthenticationService} from '../../services/authentication.service';
import {NavigationService} from '../../services/navigation.service';
import {ResourceService} from '../../services/resource.service';
import {URLParameter} from '../../domain/url-parameter';
import {Subscription} from 'rxjs';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-top-menu',
  templateUrl: './topmenu.component.html',
  styleUrls: ['./topmenu.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class TopMenuComponent implements OnInit, OnDestroy {

  serviceORresource = environment.serviceORresource;

  public searchForm: FormGroup;

  urlParameters: URLParameter[] = [];
  //
  @ViewChild('categoriesDropdown', { static: false }) categoriesDropdown: ElementRef;
  // @ViewChild('supportDropdown') supportDropdown: ElementRef;

  categoriesOpen = false;
  supportOpen = false;

  constructor(public authenticationService: AuthenticationService, private renderer: Renderer2,
              public router: Router, public fb: FormBuilder, public navigationService: NavigationService,
              private route: ActivatedRoute, public resourceService: ResourceService) {
    this.searchForm = fb.group({'query': ['']});
  }

  onSubmit(searchValue: string) {
    searchValue = searchValue.replace(/[;=]/g, '');
    let url = window.location.href;
    let params: String[] = url.split(';');
    // console.log(params);
    if (params.length > 1) {
      const query: String[] = params[1].split('=');
      console.log(query);
      if (query[0] === 'query') {
        query[1] = searchValue;
      } else {
        query[0] = 'query=' + searchValue + ';' + query[0];
      }// else { return this.navigationService.search({query: searchValue}); }
      console.log(params);
      params[1] = query.join('=');
      params = params.slice(1);
      url = params.join(';');
      window.location.href = '/search;' + url;
    } else {
      return this.navigationService.search({query: searchValue});
    }
  }

  ngOnInit(): void {
    // this.isLoggedIn();
    // this.getUsername();
    // this.getUsersurname();

    this.navigationService.paramsObservable.subscribe(params => {

      if (params != null) {
        for (const urlParameter of params) {
          if (urlParameter.key === 'query') {
            this.searchForm.get('query').setValue(urlParameter.values[0]);
          }
        }
      } else {
        this.searchForm.get('query').setValue('');
      }

    });
  }

  ngOnDestroy(): void {
  }

  // ngDoCheck(): void {
  //     if (this.categoriesDropdown.nativeElement.classList.contains("uk-open")) {
  //         console.log("it is open");
  //     } else {
  //         console.log("it is closed");
  //     }
  // }

  // ngOnInit() {
  //     console.log(this.router.url);
  //     //using selectRootElement instead of depreaced invokeElementMethod
  //     //this.categoriesDropdown.nativeElement.subscribe(console.log("aaaa"))
  //     //this.renderer.selectRootElement(this.categoriesDropdown["nativeElement"]).
  //     //this.renderer.selectRootElement(this.categoriesDropdown["nativeElement"]).onHover.subscribe(console.log("hover"));
  //     // this.renderer.selectRootElement(this.categoriesDropdown["nativeElement"]).focus();
  // }

  // onChangeOpen(event: any) {
  //     console.log(event);
  // }

  // openDropdown(id: string) {
  //     if(id=='categories')
  //         this.categoriesOpen = true;
  //     if(id=='support')
  //         this.supportOpen = true;
  // }
  //
  // closeDropdown(id: string) {
  //     if(id=='categories')
  //         this.categoriesOpen = false;
  //     if(id=='support')
  //         this.supportOpen = false;
  // }

  onClick(id: string) {
    const el: HTMLElement = document.getElementById(id);
    el.classList.remove('uk-open');
  }
}
