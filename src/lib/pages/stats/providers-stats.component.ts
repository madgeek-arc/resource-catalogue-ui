import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {ActivatedRoute} from '@angular/router';

declare var UIkit: any;


@Component({
  selector: 'app-provider-stats',
  templateUrl: './providers-stats.component.html',
  // styleUrls: ['']
})

export class ProvidersStatsComponent implements OnInit {

  private chartsURL = environment.STATS_ENDPOINT + 'chart?json=';

  activeView: string = 'general';

  // General Tab

  generalTabIsInitialised: boolean = false;

  onboardingTimelineChartURL: SafeResourceUrl;

  byLegalStatusChartURL: SafeResourceUrl;
  byLifecycleStatusChartURL: SafeResourceUrl;
  byNetworksChartURL: SafeResourceUrl;
  byAreaOfActivityChartURL: SafeResourceUrl;

  // Classification Tab

  classificationTabIsInitialised: boolean = false;

  byScientificDomainChartURL: SafeResourceUrl;
  byScientificSubdomainChartURL: SafeResourceUrl;
  byESFRIDomainChartURL: SafeResourceUrl;
  byMerilDomainChartURL: SafeResourceUrl;
  byMerilSubdomainChartURL: SafeResourceUrl;

  constructor(private route: ActivatedRoute,
              private sanitizer: DomSanitizer) { }

  ngOnInit(): void {

    window.scroll(0, 0);

    this.createGeneralContent();
  }

  changeView(view: string) {
    this.activeView = view;
    // console.log('top view: ', view);
    if (view === 'general') {
      this.createGeneralContent();
    } else if (view === 'classification') {
      this.createClassificationContent();
    }
  }

  private createGeneralContent() {

    if (!this.generalTabIsInitialised) {
      this.onboardingTimelineChartURL = this.sanitizer.bypassSecurityTrustResourceUrl(this.chartsURL + encodeURIComponent(`{"library":"HighCharts","chartDescription":{"queries":[{"name":"providers onboarded","type":"line","query":{"name":"providers.timeline","parameters":[],"profile":"eosc"}}],"chart":{"backgroundColor":"#FFFFFFFF","borderColor":"#335cadff","borderRadius":0,"borderWidth":0,"plotBorderColor":"#ccccccff","plotBorderWidth":0},"title":{"text":"Onboarded per month","align":"left","margin":50},"subtitle":{},"yAxis":{"title":{"text":"providers"}},"xAxis":{"title":{"text":""}},"legend": {"enabled": false},"lang":{"noData":"No Data available for the Query"},"exporting":{"enabled":true},"plotOptions":{"series":{"dataLabels":{"enabled":false},"stacking":"normal"}},"legend":{"enabled":true,"align":"center","verticalAlign":"bottom","layout":"horizontal"},"credits":{"href":null,"enabled":false}}}`));

      this.byLegalStatusChartURL = this.sanitizer.bypassSecurityTrustResourceUrl(this.chartsURL + encodeURIComponent(`{"library":"HighCharts","chartDescription":{"queries":[{"name":"legal status","type":"bar","query":{"name":"providers.legal_status","parameters":[],"profile":"eosc"}}],"chart":{"backgroundColor":"#FFFFFFFF","borderColor":"#335cadff","borderRadius":0,"borderWidth":0,"plotBorderColor":"#ccccccff","plotBorderWidth":0},"title":{"text":"Legal status","align":"left","margin":50},"subtitle":{"text":"(top 10)","align":"left","margin":50},"yAxis":{"title":{"text":"providers"}},"xAxis":{"title":{"text":""}},"legend": {"enabled": false},"lang":{"noData":"No Data available for the Query"},"exporting":{"enabled":true},"plotOptions":{"series":{"dataLabels":{"enabled":false},"stacking":"normal"}},"legend":{"enabled":true,"align":"center","verticalAlign":"bottom","layout":"horizontal"},"credits":{"href":null,"enabled":false}}}`));
      this.byLifecycleStatusChartURL = this.sanitizer.bypassSecurityTrustResourceUrl(this.chartsURL + encodeURIComponent(`{"library":"HighCharts","chartDescription":{"queries":[{"name":"lifecycle","type":"pie","query":{"name":"providers.life_cycle","parameters":[],"profile":"eosc"}}],"chart":{"backgroundColor":"#FFFFFFFF","borderColor":"#335cadff","borderRadius":0,"borderWidth":0,"plotBorderColor":"#ccccccff","plotBorderWidth":0},"title":{"text":"Lifecycle","align":"left","margin":50},"subtitle":{},"yAxis":{"title":{"text":"providers"}},"xAxis":{"title":{"text":""}},"legend": {"enabled": false},"lang":{"noData":"No Data available for the Query"},"exporting":{"enabled":true},"plotOptions":{"series":{"dataLabels":{"enabled":true},"stacking":"normal"}},"legend":{"enabled":true,"align":"center","verticalAlign":"bottom","layout":"horizontal"},"credits":{"href":null,"enabled":false}}}`));
      this.byNetworksChartURL = this.sanitizer.bypassSecurityTrustResourceUrl(this.chartsURL + encodeURIComponent(`{"library":"HighCharts","chartDescription":{"queries":[{"name":"network","type":"bar","query":{"name":"providers.network","parameters":[],"profile":"eosc"}}],"chart":{"backgroundColor":"#FFFFFFFF","borderColor":"#335cadff","borderRadius":0,"borderWidth":0,"plotBorderColor":"#ccccccff","plotBorderWidth":0},"title":{"text":"Network","align":"left","margin":50},"subtitle":{"text":"(top 10)","align":"left","margin":50},"yAxis":{"title":{"text":"providers"}},"xAxis":{"title":{"text":""}},"legend": {"enabled": false},"lang":{"noData":"No Data available for the Query"},"exporting":{"enabled":true},"plotOptions":{"series":{"dataLabels":{"enabled":false},"stacking":"normal"}},"legend":{"enabled":true,"align":"center","verticalAlign":"bottom","layout":"horizontal"},"credits":{"href":null,"enabled":false}}}`));
      this.byAreaOfActivityChartURL = this.sanitizer.bypassSecurityTrustResourceUrl(this.chartsURL + encodeURIComponent(`{"library":"HighCharts","chartDescription":{"queries":[{"name":"area of activity","type":"bar","query":{"name":"providers.area_of_activity","parameters":[],"profile":"eosc"}}],"chart":{"backgroundColor":"#FFFFFFFF","borderColor":"#335cadff","borderRadius":0,"borderWidth":0,"plotBorderColor":"#ccccccff","plotBorderWidth":0},"title":{"text":"Areas of activity","align":"left","margin":50},"subtitle":{"text":"(top 10)","align":"left","margin":50},"yAxis":{"title":{"text":"providers"}},"xAxis":{"title":{"text":""}},"legend": {"enabled": false},"lang":{"noData":"No Data available for the Query"},"exporting":{"enabled":true},"plotOptions":{"series":{"dataLabels":{"enabled":false},"stacking":"normal"}},"legend":{"enabled":true,"align":"center","verticalAlign":"bottom","layout":"horizontal"},"credits":{"href":null,"enabled":false}}}`));

      this.generalTabIsInitialised = true;
    }
  }

  private createClassificationContent() {

    if (!this.classificationTabIsInitialised) {
      this.byScientificDomainChartURL = this.sanitizer.bypassSecurityTrustResourceUrl(this.chartsURL + encodeURIComponent(`{"library":"HighCharts","chartDescription":{"queries":[{"name":"scientific domain","type":"bar","query":{"name":"providers.scientific_domain","parameters":[],"profile":"eosc"}}],"chart":{"backgroundColor":"#FFFFFFFF","borderColor":"#335cadff","borderRadius":0,"borderWidth":0,"plotBorderColor":"#ccccccff","plotBorderWidth":0},"title":{"text":"Scientific domain","align":"left","margin":50},"subtitle":{"text":"(top 10)","align":"left","margin":50},"yAxis":{"title":{"text":"providers"}},"xAxis":{"title":{"text":""}},"legend": {"enabled": false},"lang":{"noData":"No Data available for the Query"},"exporting":{"enabled":true},"plotOptions":{"series":{"dataLabels":{"enabled":false},"stacking":"normal"}},"legend":{"enabled":true,"align":"center","verticalAlign":"bottom","layout":"horizontal"},"credits":{"href":null,"enabled":false}}}`));
      this.byScientificSubdomainChartURL = this.sanitizer.bypassSecurityTrustResourceUrl(this.chartsURL + encodeURIComponent(`{"library":"HighCharts","chartDescription":{"queries":[{"name":"scientific subdomain","type":"bar","query":{"name":"providers.scientific_subdomain","parameters":[],"profile":"eosc"}}],"chart":{"backgroundColor":"#FFFFFFFF","borderColor":"#335cadff","borderRadius":0,"borderWidth":0,"plotBorderColor":"#ccccccff","plotBorderWidth":0},"title":{"text":"Scientific subdomain","align":"left","margin":50},"subtitle":{"text":"(top 10)","align":"left","margin":50},"yAxis":{"title":{"text":"providers"}},"xAxis":{"title":{"text":""}},"legend": {"enabled": false},"lang":{"noData":"No Data available for the Query"},"exporting":{"enabled":true},"plotOptions":{"series":{"dataLabels":{"enabled":false},"stacking":"normal"}},"legend":{"enabled":true,"align":"center","verticalAlign":"bottom","layout":"horizontal"},"credits":{"href":null,"enabled":false}}}`));
      this.byESFRIDomainChartURL = this.sanitizer.bypassSecurityTrustResourceUrl(this.chartsURL + encodeURIComponent(`{"library":"HighCharts","chartDescription":{"queries":[{"name":"esfri domain","type":"bar","query":{"name":"providers.esfri","parameters":[],"profile":"eosc"}}],"chart":{"backgroundColor":"#FFFFFFFF","borderColor":"#335cadff","borderRadius":0,"borderWidth":0,"plotBorderColor":"#ccccccff","plotBorderWidth":0},"title":{"text":"ESFRI domain","align":"left","margin":50},"subtitle":{"text":"(top 10)","align":"left","margin":50},"yAxis":{"title":{"text":"providers"}},"xAxis":{"title":{"text":""}},"legend": {"enabled": false},"lang":{"noData":"No Data available for the Query"},"exporting":{"enabled":true},"plotOptions":{"series":{"dataLabels":{"enabled":false},"stacking":"normal"}},"legend":{"enabled":true,"align":"center","verticalAlign":"bottom","layout":"horizontal"},"credits":{"href":null,"enabled":false}}}`));
      this.byMerilDomainChartURL = this.sanitizer.bypassSecurityTrustResourceUrl(this.chartsURL + encodeURIComponent(`{"library":"HighCharts","chartDescription":{"queries":[{"name":"meril domain","type":"bar","query":{"name":"providers.meril_domain","parameters":[],"profile":"eosc"}}],"chart":{"backgroundColor":"#FFFFFFFF","borderColor":"#335cadff","borderRadius":0,"borderWidth":0,"plotBorderColor":"#ccccccff","plotBorderWidth":0},"title":{"text":"Meril domain","align":"left","margin":50},"subtitle":{"text":"(top 10)","align":"left","margin":50},"yAxis":{"title":{"text":"providers"}},"xAxis":{"title":{"text":""}},"legend": {"enabled": false},"lang":{"noData":"No Data available for the Query"},"exporting":{"enabled":true},"plotOptions":{"series":{"dataLabels":{"enabled":false},"stacking":"normal"}},"legend":{"enabled":true,"align":"center","verticalAlign":"bottom","layout":"horizontal"},"credits":{"href":null,"enabled":false}}}`));
      this.byMerilSubdomainChartURL = this.sanitizer.bypassSecurityTrustResourceUrl(this.chartsURL + encodeURIComponent(`{"library":"HighCharts","chartDescription":{"queries":[{"name":"meril subdomain","type":"bar","query":{"name":"providers.meril_subdomain","parameters":[],"profile":"eosc"}}],"chart":{"backgroundColor":"#FFFFFFFF","borderColor":"#335cadff","borderRadius":0,"borderWidth":0,"plotBorderColor":"#ccccccff","plotBorderWidth":0},"title":{"text":"Meril subdomain","align":"left","margin":50},"subtitle":{"text":"(top 10)","align":"left","margin":50},"yAxis":{"title":{"text":"providers"}},"xAxis":{"title":{"text":""}},"legend": {"enabled": false},"lang":{"noData":"No Data available for the Query"},"exporting":{"enabled":true},"plotOptions":{"series":{"dataLabels":{"enabled":false},"stacking":"normal"}},"legend":{"enabled":true,"align":"center","verticalAlign":"bottom","layout":"horizontal"},"credits":{"href":null,"enabled":false}}}`));

      this.classificationTabIsInitialised = true;
    }
  }
}
