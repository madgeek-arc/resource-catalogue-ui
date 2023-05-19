import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';

@Injectable()
export class RecommendationsService {
  private baseForInsights = environment.INSIGHTS_ENDPOINT;
  private baseForAutocompletion = environment.AUTOCOMPLETION_ENDPOINT;

  constructor(private http: HttpClient) {}

  getRecommendationsOverTime(publicProviderId: string, publicServiceId?: string) {
    let body;
    if (!publicServiceId) body = `{"provider_id":"${publicProviderId}"}`
    else body = `{"provider_id":"${publicProviderId}", "service_id":"${publicServiceId}"}`
    return this.http.post(this.baseForInsights + `/daily`, JSON.parse(body));
  }

  getMostRecommendedServices(publicProviderId: string) {
    const body = `{"provider_id":"${publicProviderId}", "top_n":"3"}`;
    return this.http.post(this.baseForInsights + `/most_recommended/`, JSON.parse(body));
  }

  getCompetitorsServices(publicProviderId: string, publicServiceId?: string) {
    let body;
    if (!publicServiceId) body = `{"provider_id":"${publicProviderId}"}`
    else body = `{"provider_id":"${publicProviderId}", "service_id":"${publicServiceId}"}`
    // {
    //   "provider_id": "string",
    //   "service_id": 0,
    //   "top_services_numb": 5,
    //   "top_competitors_numb": 5
    // }
    return this.http.post(this.baseForInsights + `/most_recommended_along_your_services/`, JSON.parse(body));
  }

  getAutocompletionSuggestions(name: string, description: string, tagline: string) { //TODO: remove name input (v1.0.2)
    const body = `{
                    "new_service": {
                        "name": "${name}",
                        "description": "${description}",
                        "tagline": "${tagline}"
                    },
                    "fields_to_suggest": [
                        "scientific_domains",
                        "categories"
                    ],
                    "maximum_suggestions": 3
                  }`;
    return this.http.post(this.baseForAutocompletion + `/suggest`, JSON.parse(body));
  }

}
