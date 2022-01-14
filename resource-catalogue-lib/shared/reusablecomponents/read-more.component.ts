/**
 * Created by stefania on 4/6/17.
 */
import {AfterContentInit, AfterViewInit, Component, ElementRef, Input, OnChanges, ViewChild} from "@angular/core";

@Component({
    selector: "read-more",
    template: `
        <div [class.collapsed]="isCollapsed" [style.height]="isCollapsed ? maxHeight+'px' : 'auto'" #readMoreDiv>
            <ng-content></ng-content>
        </div>
        <a *ngIf="isCollapsable" (click)="isCollapsed =! isCollapsed">View {{isCollapsed ? 'more' : 'less'}}...</a>
    `,
    styles: [`
        div.collapsed {
            overflow: hidden;
        }
    `]
})
export class ReadMoreComponent implements AfterContentInit {
    //the text that need to be put in the container
    //@Input() text: string;
    //maximum height of the container
    @Input("maxHeight") maxHeight: number = 100;
    @ViewChild("readMoreDiv", { static: true })
    readMoreDiv: ElementRef;
    //set these to false to get the height of the expended container
    public isCollapsed: boolean = false;
    public isCollapsable: boolean = false;

    constructor(public elementRef: ElementRef) {
    }

    ngAfterContentInit() {
        setTimeout(_ => {
            let currentHeight = this.readMoreDiv.nativeElement.offsetHeight;
            //collapsable only if the contents make container exceed the max height
            if (currentHeight > this.maxHeight) {
                this.isCollapsed = true;
                this.isCollapsable = true;
            } else {
            }
        }, 200);
    }
}

@Component({
    selector: "read-more-text",
    template: `
        <div [innerHTML]="text" [class.collapsed]="isCollapsed" [style.height]="isCollapsed ? maxHeight+'px' : 'auto'" #readMoreDiv>
            <!--{{text}}-->
        </div>
        <a *ngIf="isCollapsable" (click)="isCollapsed =! isCollapsed">View {{isCollapsed ? 'more' : 'less'}}...</a>
    `,
    styles: [`
        div.collapsed {
            overflow: hidden;
        }
    `]
})
export class ReadMoreTextComponent extends ReadMoreComponent implements OnChanges, AfterViewInit {
    @Input()
    text: string = "";

    ngAfterViewInit(): void {
        this.ngAfterContentInit();
    }

    ngOnChanges(): void {
        this.ngAfterContentInit();
    }
}

