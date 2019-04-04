import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from '@angular/router';
import {AuthenticationService} from './authentication.service';
import {NavigationService} from './navigation.service';

@Injectable()
export class CanActivateViaAuthGuard implements CanActivate {
    constructor(public authenticationService: AuthenticationService, public router: NavigationService) {
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
