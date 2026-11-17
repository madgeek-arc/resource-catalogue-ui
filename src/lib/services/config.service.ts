import {Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {environment} from "../../environments/environment";

export type OnboardingPolicy = 'review-all' | 'review-first' | 'review-none';

// What a node without a configurable policy (older back end, lot1) has always done.
const LEGACY_ONBOARDING_POLICY: { [resourceType: string]: OnboardingPolicy } = {
  service: 'review-first',
  datasource: 'review-first',
  training_resource: 'review-first',
  deployable_application: 'review-first',
  adapter: 'review-none',
  interoperability_record: 'review-all'
};

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private config: any;

  constructor(private http: HttpClient) {}

  base = environment.API_ENDPOINT;

  loadConfig(): Promise<any> {
    return this.http.get(this.base + '/config').toPromise().then(config => {
      this.config = config;
    });
  }

  getProperty(key: string): any {
    return this.config ? this.config[key] : null;
  }

  getAllProperties(): any {
    return this.config;
  }

  /**
   * How resources of the given type are onboarded: 'review-all' (every resource is reviewed),
   * 'review-first' (the Organisation's first resource is reviewed as its template, the rest are approved
   * once it is approved) or 'review-none' (resources are approved immediately).
   * @param resourceType service, datasource, training_resource, deployable_application, adapter
   * or interoperability_record
   */
  getOnboardingPolicy(resourceType: string): OnboardingPolicy {
    const policies = this.getProperty('onboardingPolicy');
    return (policies && policies[resourceType]) || LEGACY_ONBOARDING_POLICY[resourceType];
  }

  isReviewFirst(resourceType: string): boolean {
    return this.getOnboardingPolicy(resourceType) === 'review-first';
  }

  /** True when at least one resource type has a template, i.e. when an Organisation's template status matters. */
  isAnyReviewFirst(): boolean {
    return Object.keys(LEGACY_ONBOARDING_POLICY).some(type => this.isReviewFirst(type));
  }
}
