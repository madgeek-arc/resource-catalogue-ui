import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Content, PageContent} from '../../domain/page-content';
import {HelpContentService} from '../../services/help-content.service';
import {environment} from '../../../environments/environment';

@Component({
    selector: 'app-help-content',
    template: `
        <ng-template [ngIf]="contents && contents.length>0">
            <ng-template ngFor let-content [ngForOf]="contents">
                <div [innerHTML]="content.content" class="uk-margin-medium-bottom"></div>
            </ng-template>
        </ng-template>
    `
})
export class HelpContentComponent implements OnInit {
    @Input('position')
    position: string;
    contents: Content[];
    errorMessage: string = null;

    constructor(public _helpContentService: HelpContentService, public route: ActivatedRoute,
                public router: Router) {
    }

    ngOnInit() {
        this.errorMessage = null;
        if (environment.showHelpContent) {
          this._helpContentService.getActivePageContent(this.router.url).subscribe(
            pageContent => this.shiftThroughContent(pageContent));
        }
    }

    shiftThroughContent(pageContent: PageContent) {
        this.contents = pageContent.content[this.position];
    }

    isPresent() {
        return (this.contents && this.contents.length > 0);
    }

    handleError(error) {
        this.errorMessage = 'System error retrieving page content (Server responded: ' + error + ')';
    }
}

@Component({
    selector: 'app-aside-help-content',
    template: `
        <ng-template [ngIf]="contents && contents.length>0">
            <ng-template ngFor let-content [ngForOf]="contents">
                <div [innerHTML]="content.content"
                     class="uk-card uk-card-body uk-card-default sidemenu uk-margin-bottom"></div>
            </ng-template>
        </ng-template>
    `
})
export class AsideHelpContentComponent extends HelpContentComponent {
}
