import {Injectable} from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import {AuthenticationService} from './authentication.service';
import {NavigationService} from './navigation.service';

@Injectable()
export class CanActivateViaPubGuard  {
    constructor(public authenticationService: AuthenticationService, public navigator: NavigationService) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return !this.authenticationService.isLoggedIn() || (this.navigator.home() && false);
    }
}
