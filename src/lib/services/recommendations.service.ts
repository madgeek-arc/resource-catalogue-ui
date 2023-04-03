import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class RecommendationsService {
  private base = 'provider_insights_api/v1/statistics/rs';

  constructor(private http: HttpClient) {}

  getRecommendationsOverTime(providerId: string, serviceId?: string) {
    let body;
    if (!serviceId) body = `{"provider_id":"${providerId}"}`
    else body = `{"provider_id":"${providerId}", "service_id":"${serviceId}"}`
    return this.http.post(this.base + `/daily`, JSON.parse(body));
  }

  getMostRecommendedServices(providerId: string) {
    const body = `{"provider_id":"${providerId}", "top_n":"3"}`;
    return this.http.post(this.base + `/most_recommended/`, JSON.parse(body));
  }

  getCompetitorsServices(providerId: string) {
    const body = `{"provider_id":"${providerId}"}`;
    // {
    //   "provider_id": "string",
    //   "service_id": 0,
    //   "top_services_numb": 5,
    //   "top_competitors_numb": 5
    // }
    return this.http.post(this.base + `/most_recommended_along_your_services/`, JSON.parse(body));
  }
}
