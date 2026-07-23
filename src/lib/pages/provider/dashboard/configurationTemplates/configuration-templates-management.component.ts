import {Component, OnInit, inject, isDevMode} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';

import { GuidelinesService } from '../../../../services/guidelines.service';

import {pidHandler} from "../../../../shared/pid-handler/pid-handler.service";
import {FormBuilderService} from "../../../../../dynamic-catalogue/services/form-builder.service";

import UIkit from 'uikit';

export interface ConfigurationTemplate {
  id: string;
  configurationTemplate: {
    id: string;
    name: string;
    description?: string;
  };
}

@Component({
  selector: 'app-configuration-templates-management',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatListModule,
  ],
  templateUrl: './configuration-templates-management.component.html',
})
export class ConfigurationTemplatesManagementComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private guidelinesService = inject(GuidelinesService);
  private readonly pidHandler = inject(pidHandler);
  private readonly formBuilderService = inject(FormBuilderService);

  guidelineId!: string;

  templates: ConfigurationTemplate[] = [];
  instanceCounts: Record<string, number> = {};
  loading = false;
  error: string | null = null;

  ngOnInit(): void {
    this.guidelineId = this.route.snapshot.paramMap.get('guidelineId')!;
    this.loadTemplates();
  }

  loadTemplates(): void {
    this.loading = true;
    this.error = null;

    this.guidelinesService.getTemplatesForGuidelineWithAuth(this.guidelineId).subscribe({
        next: (res) => {
          this.templates = res ?? [];

          // count instances for each configuration template
          this.templates.forEach(template => {
            this.guidelinesService
              .getInstancesByConfigurationTemplateId(template.id)
              .subscribe({
                next: (instances: any[]) => {
                  this.instanceCounts[template.id] = instances?.length ?? 0;
                },
                error: () => {
                  this.instanceCounts[template.id] = 0;
                }
              });
          });

          this.loading = false;
        },
        error: () => {
          this.error = 'Failed to load templates';
          this.loading = false;
        }
      });
  }

  createNew(): void {
    this.formBuilderService.clear();
    this.router.navigate([
      `/guidelines/${this.guidelineId}/model/new`,
    ]);
  }

  edit(configurationTemplateid): void {
    // console.log(`/guidelines/${this.guidelineId}/model/${this.pidHandler.customEncodeURIComponent(ct.id)}/edit`);
    // this.formBuilderService.setModel(template);
    this.formBuilderService.clear();
    this.router.navigate([
      'guidelines', this.guidelineId, 'model', configurationTemplateid, 'edit'
    ]);
  }

  confirmDelete(configurationTemplateId: string): void {
    UIkit.modal.confirm(
      `You are about to delete configuration template <strong>${configurationTemplateId}</strong>.<br><br>Are you sure?`
    ).then(() => {
      this.delete(configurationTemplateId);
    });
  }

  delete(configurationTemplateId: string): void {
    this.guidelinesService.deleteConfigurationTemplateWithModel(configurationTemplateId).subscribe({
      next: () => {
        window.location.reload();
      },
      error: (err) => {
        this.error = err.error.detail;
      }
    });
  }

  // transformToModelId(templateId: string): string {
  //   return 'm-b-' + templateId.replace('/', '-'); //todo: could simplify ids and remove this
  // }

  protected readonly isDevMode = isDevMode;
}
