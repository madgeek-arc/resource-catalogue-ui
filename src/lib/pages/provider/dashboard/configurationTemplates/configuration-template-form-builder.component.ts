import {Component, inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { FormBuilderComponent } from '../../../../../dynamic-catalogue/pages/form-builder/form-builder.component';
import { DynamicCatalogueService } from '../../../../../dynamic-catalogue/services/dynamic-catalogue.service';
import {GuidelinesService} from "../../../../services/guidelines.service";
import {FormBuilderService} from "../../../../../dynamic-catalogue/services/form-builder.service";

@Component({
  standalone: true,
  imports: [FormBuilderComponent],
  template:
    '<h1 style="margin-left: 12px;">Configuration Template Form Builder</h1>' +
    '<app-form-builder [customActions]="true" (saveAction)="saveMethod($event)" [backDestination]="backDestination"></app-form-builder>'
})
export class ConfigurationTemplateFormBuilderComponent implements OnInit {
  private dynamicCatalogueService = inject(DynamicCatalogueService);
  private guidelinesService = inject(GuidelinesService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private readonly formBuilderService = inject(FormBuilderService);

  guidelineId!: string;
  backDestination!: string;
  isSaving = false;

  ngOnInit() {
    this.guidelineId = this.route.snapshot.paramMap.get('guidelineId')!;
    this.backDestination = '/guidelines/'+this.guidelineId+'/configuration-templates-management';

    const id = this.route.snapshot.paramMap.get('id');
    if (id) { // on edit
      this.loadExistingTemplate(id);
    } else { // on create new
      this.loadBaseTemplate();
    }
  }

  loadExistingTemplate(id :string): void {
    this.guidelinesService.getExistingTemplate(id).subscribe({
      next: (template) => {
        this.formBuilderService.setModel(template);
      },
      error: (err) => {
        console.error('Failed to load template', err.error.detail);
      }
    });
  }

  loadBaseTemplate(): void {
    this.guidelinesService.getBaseTemplate().subscribe({
      next: (template) => {
        this.formBuilderService.setModel(template);
      },
      error: (err) => {
        console.error('Failed to load base template', err.error.detail);
      }
    });
  }

  saveMethod(data: any) {
    if (this.isSaving) return; //prevent double saves

    this.isSaving = true;

    const isEdit = !!data.id;

    this.guidelinesService.saveModel(data, isEdit, this.guidelineId)
      .subscribe({
        next: () => {
          this.router.navigate([`/guidelines/${this.guidelineId}/configuration-templates-management`]);
        },
        error: (err) => {
          console.log('Failed:', err.error.detail);
          this.isSaving = false;
        }
      });
  }

}
