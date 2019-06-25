# How to create a new sub project

## Create

Clone or download repository, navigate to root directory eic-platform-angular6  run `ng generate application yourAppName --routing`. 
This will create a new application, residing right next to the default application.
 
## Development server

Run `ng serve --project yourAppName` for a dev server. 
Angular sets the default port to `4200` this can be set by adding the parameter `--port` followed by the desired port number.
`ng serve --project yourAppName --port 3000`

## Build

Run `ng build --project yourAppName` to build the project. The build artifacts will be stored in the `dist/` directory. 
Use the `--prod` flag for a production build.

## First steps

Firstly the files `app.module.ts` and `app.component.ts` should be renamed in order to avoid conflicts with the respective files in the main application.
Then import `AppModule` from the main application to the sub projects `renamed.module.ts`. 
Also extend the `renamed.component.ts` like so `export class RenamedComponent extends AppComponent { }`

Now the html can be added. To test that everything has worked so far, replace the content of the `app.component.html` with:
```
<div class="uk-offcanvas-content">
 <app-top-menu *ngIf="!isLoginOrRegister"></app-top-menu>
 <app-breadcrumbs *ngIf="router.url != '/home' && router.url != '/'"></app-breadcrumbs>
 <div style="min-height: 80px">
   <router-outlet></router-outlet>
 </div>
 <app-feedback></app-feedback>
 <app-footer></app-footer>
</div>
```
This should create an duplicate of `eInfraCentral`, in order to display correctly UiKit, FontAwesome, theme css and images from assets folder are needed.

