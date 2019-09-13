# How to create a new Subproject

## Create

1. Clone or download the repository.
2. Navigate to the root directory 'eic-platform-angular6' and execute: <br/> 
`ng generate application yourAppName --routing` <br/>
This will create a new application, residing right next to the default application.

 
## Development server

* For a dev server, execute: `ng serve --project yourAppName`

 _Angular sets the default port to_ `4200`. _You can set another port using the parameter_ `--port` _followed by the desired port number
(e.g. `ng serve --project yourAppName --port 3000`)._

## Build

* To build the application, execute: `ng build --project yourAppName`
* For a production build use the `--prod` flag.

_The build artifacts will be stored in the `dist/` directory._

## First steps

1. Rename the files `app.module.ts` and `app.component.ts` in order to avoid conflicts with the respective files in the main application.
2. Import `AppModule` from the main application to the subproject's `renamed.module.ts`. 
3. Open the `renamed.component.ts` file and replace `export class RenamedComponent { ... }`
 with `export class RenamedComponent extends AppComponent { ... }`.

4. To test that everything has worked so far, replace the content of the `app.component.html` of your subproject with the following code:
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
This should create a duplicate of `eInfraCentral`. <br/>

___In order to display properly the UiKit, FontAwesome, CSS themes and images, do the following:___

1. The assets folder of the main project is needed.
2. To add  UiKit and FontAwesome to the sub project, insert the following lines at your sub project in the `angular.json` file
```
"styles": [
  "projects/youSubProjecName/src/styles.css",
  "node_modules/font-awesome/css/font-awesome.css"
],
"scripts": [
  "node_modules/jquery/dist/jquery.min.js",
  "node_modules/uikit/dist/js/uikit.min.js",
  "node_modules/uikit/dist/js/uikit-icons.min.js"
]
``` 
