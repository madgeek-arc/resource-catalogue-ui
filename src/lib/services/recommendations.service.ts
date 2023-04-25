import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';

@Injectable()
export class RecommendationsService {
  private baseForInsights = environment.INSIGHTS_ENDPOINT;
  private baseForAutocompletion = environment.AUTOCOMPLETION_ENDPOINT;

  constructor(private http: HttpClient) {}

  getRecommendationsOverTime(providerId: string, serviceId?: string) {
    let body;
    if (!serviceId) body = `{"provider_id":"${providerId}"}`
    else body = `{"provider_id":"${providerId}", "service_id":"${serviceId}"}`
    return this.http.post(this.baseForInsights + `/daily`, JSON.parse(body));
  }

  getMostRecommendedServices(providerId: string) {
    const body = `{"provider_id":"${providerId}", "top_n":"3"}`;
    return this.http.post(this.baseForInsights + `/most_recommended/`, JSON.parse(body));
  }

  getCompetitorsServices(providerId: string, serviceId?: string) {
    let body;
    if (!serviceId) body = `{"provider_id":"${providerId}"}`
    else body = `{"provider_id":"${providerId}", "service_id":"${serviceId}"}`
    // {
    //   "provider_id": "string",
    //   "service_id": 0,
    //   "top_services_numb": 5,
    //   "top_competitors_numb": 5
    // }
    return this.http.post(this.baseForInsights + `/most_recommended_along_your_services/`, JSON.parse(body));
  }

  getAutocompletionSuggestions(name: string, description: string, tagline: string) {
    const body = `{
                    "new_service": {
                        "name": "${name}",
                        "description": "${description}",
                        "tagline": "${tagline}"
                    },
                    "fields_to_suggest": [
                        "scientific_domains",
                        "categories",
                        "target_users"
                    ],
                    "maximum_suggestions": 3
                  }`;
    return this.http.post(this.baseForAutocompletion + `/suggest`, JSON.parse(body));
  }

}
