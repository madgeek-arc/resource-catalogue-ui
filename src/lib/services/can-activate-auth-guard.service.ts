import {Injectable} from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import {AuthenticationService} from './authentication.service';
import {NavigationService} from './navigation.service';

@Injectable()
export class CanActivateViaAuthGuard  {
    constructor(public authenticationService: AuthenticationService, public navigator: NavigationService) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        const ret = this.authenticationService.isLoggedIn();
        if (!ret) {
            this.authenticationService.redirectURL = state.url;
            this.authenticationService.login();
        }
        return ret;
    }
}
