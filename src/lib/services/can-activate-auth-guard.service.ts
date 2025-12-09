import {Injectable} from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import {AuthenticationService} from './authentication.service';
import {NavigationService} from './navigation.service';

@Injectable()
export class CanActivateViaAuthGuard  {
    constructor(public authenticationService: AuthenticationService, public navigator: NavigationService) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        const ret = this.authenticationService.getIsUserLoggedIn();
        if (!ret) {
            this.authenticationService.refreshLogin(null);
        }
        return ret;
    }
}
