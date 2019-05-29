/**
 * Created by stefania on 7/5/16.
 */
import { Component, ViewEncapsulation } from "@angular/core";
import { AuthenticationService } from "../../services/authentication.service";
import { Router } from "@angular/router";
import {Subscription} from "rxjs/Subscription";

@Component({
    selector: "top-menu",
    templateUrl: "./topmenu.component.html",
    styles: [`
        .uk-navbar-nav > li > a.loginLink {
            color: #214c9c;
        }
    `],
    encapsulation: ViewEncapsulation.None
})
export class TopMenuComponent {

    private sub: Subscription;

    constructor(public authenticationService: AuthenticationService, public route: Router) {
    }

    ngOnInit(): void {
        this.isLoggedIn();
        this.getUsername();
        this.getUsersurname();
    }

    ngOnDestroy(): void {
        if (this.authenticationService.isLoggedIn()) {
            this.sub.unsubscribe();
        }
    }

    goToLoginAAI(): void {
        this.authenticationService.login();
    }

    isLoggedIn() {
        return this.authenticationService.isLoggedIn();
    }

    getUsername() {
        if (this.authenticationService.isLoggedIn()) {
            return this.authenticationService.getUserProperty('given_name');
        }
    }

    getUsersurname() {
        if (this.authenticationService.isLoggedIn()) {
            return this.authenticationService.getUserProperty('family_name');
        }
    }

    isProvider() {
        return this.authenticationService.getUserProperty('roles').some(x => x === "ROLE_PROVIDER");
    }

    isAdmin() {
        return this.authenticationService.getUserProperty('roles').some(x => x === "ROLE_ADMIN");
    }

    get isHome() {
        return this.route.url == '/home';
    }

    onClick(id: string) {
        var el: HTMLElement = document.getElementById(id);
        el.classList.remove("uk-open");
    }
}