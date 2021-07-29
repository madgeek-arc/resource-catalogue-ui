import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { ResourceService } from '../../services/resource.service';
import { NavigationService } from '../../services/navigation.service';
import {Provider} from '../../domain/eic-model';
import {environment} from '../../../environments/environment';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import * as Highcharts from 'highcharts';
import MapModule from 'highcharts/modules/map';
MapModule(Highcharts);

const mapWorld = require('@highcharts/map-collection/custom/world.geo.json');
declare var require: any;
declare var UIkit: any;


@Component({
  selector: 'app-resources-stats',
  templateUrl: './resources-stats.component.html',
  // styleUrls: ['']
})

export class ResourcesStatsComponent implements OnInit {

  private chartsURL = environment.STATS_ENDPOINT + 'chart?json=';

  activeView: string = 'general';

  serviceORresource = environment.serviceORresource;

  providerId: string;
  provider: Provider;
  public errorMessage: string;

  public EU: string[];
  public WW: string[];

  Highcharts: typeof Highcharts = Highcharts;
  chartConstructor = 'mapChart'
  mapDistributionOfServicesOptions: any = null;

  selectedCountryName: string = null;
  selectedCountryServices: any = null;
  geographicalDistributionMap: any = null;

  // General Tab

  generalTabIsInitialised: boolean = false;

  byProviderChartURL: SafeResourceUrl;
  onboardingTimelineChartURL: SafeResourceUrl;

  // Classification Tab

  classificationTabIsInitialised: boolean = false;

  byScientificDomainChartURL: SafeResourceUrl;
  byScientificSubdomainChartURL: SafeResourceUrl;
  byCategoryChartURL: SafeResourceUrl;
  bySubcategoryChartURL: SafeResourceUrl;

  // Usage and Availability Tab

  availabilityTabIsInitialised: boolean = false;

  byAccessTypeChartURL: SafeResourceUrl;
  byAccessModeChartURL: SafeResourceUrl;
  byOrderTypeChartURL: SafeResourceUrl;

  byTargetUsersChartURL: SafeResourceUrl;
  byLanguageChartURL: SafeResourceUrl;

  // Maturity Tab

  maturityTabIsInitialised: boolean = false;

  byTRLChartURL: SafeResourceUrl;
  byLifecycleChartURL: SafeResourceUrl;

  // Funder Tab

  funderTabIsInitialised: boolean = false;

  byFundingBodyChartURL: SafeResourceUrl;
  byFundingProgramChartURL: SafeResourceUrl;


  constructor(
    public authenticationService: AuthenticationService,
    public resourceService: ResourceService,
    public router: NavigationService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {

    window.scroll(0, 0);

    this.createGeneralContent();

    this.getDataFromAllProviders();
  }

  changeView(view: string) {
    this.activeView = view;
    // console.log('top view: ', view);
    if (view === 'general') {
      this.createGeneralContent();
    } else if (view === 'classification') {
      this.createClassificationContent();
    } else if (view === 'availability') {
      this.createAvailabilityContent();
    } else if (view === 'maturity') {
      this.createMaturityContent();
    } else if (view === 'funder') {
      this.createFunderContent();
    }
  }

  private createGeneralContent() {

    if (!this.generalTabIsInitialised) {
      this.onboardingTimelineChartURL = this.sanitizer.bypassSecurityTrustResourceUrl(this.chartsURL + encodeURIComponent(`{"library":"HighCharts","chartDescription":{"queries":[{"name":"resources onboarded","type":"line","query":{"name":"resources.timeline","parameters":[],"profile":"eosc"}}],"chart":{"backgroundColor":"#FFFFFFFF","borderColor":"#335cadff","borderRadius":0,"borderWidth":0,"plotBorderColor":"#ccccccff","plotBorderWidth":0},"title":{"text":"Onboarded per month","align":"left","margin":50},"subtitle":{},"yAxis":{"title":{"text":"providers"}},"xAxis":{"title":{"text":""}},"legend": {"enabled": false},"lang":{"noData":"No Data available for the Query"},"exporting":{"enabled":true},"plotOptions":{"series":{"dataLabels":{"enabled":false},"stacking":"normal"}},"legend":{"enabled":true,"align":"center","verticalAlign":"bottom","layout":"horizontal"},"credits":{"href":null,"enabled":false}}}`));
      this.byProviderChartURL = this.sanitizer.bypassSecurityTrustResourceUrl(this.chartsURL + encodeURIComponent(`{"library":"HighCharts","chartDescription":{"queries":[{"name":"resources per provider","type":"bar","query":{"name":"resources.byprovider","parameters":[],"profile":"eosc"}}],"chart":{"backgroundColor":"#FFFFFFFF","borderColor":"#335cadff","borderRadius":0,"borderWidth":0,"plotBorderColor":"#ccccccff","plotBorderWidth":0},"title":{"text":"Providers","align":"left","margin":50},"subtitle":{"text":"(top 10)","align":"left","margin":50},"yAxis":{"title":{"text":"providers"}},"xAxis":{"title":{"text":""}},"legend": {"enabled": false},"lang":{"noData":"No Data available for the Query"},"exporting":{"enabled":true},"plotOptions":{"series":{"dataLabels":{"enabled":false},"stacking":"normal"}},"legend":{"enabled":true,"align":"center","verticalAlign":"bottom","layout":"horizontal"},"credits":{"href":null,"enabled":false}}}`));

      this.generalTabIsInitialised = true;
    }
  }

  private createClassificationContent() {

    if (!this.classificationTabIsInitialised) {
      this.byScientificDomainChartURL = this.sanitizer.bypassSecurityTrustResourceUrl(this.chartsURL + encodeURIComponent(`{"library":"HighCharts","chartDescription":{"queries":[{"name":"scientific domain","type":"bar","query":{"name":"resources.scientific_domain","parameters":[],"profile":"eosc"}}],"chart":{"backgroundColor":"#FFFFFFFF","borderColor":"#335cadff","borderRadius":0,"borderWidth":0,"plotBorderColor":"#ccccccff","plotBorderWidth":0},"title":{"text":"Scientific domains","align":"left","margin":50},"subtitle":{"text":"(top 10)","align":"left","margin":50},"yAxis":{"title":{"text":"resources"}},"xAxis":{"title":{"text":""}},"legend": {"enabled": false},"lang":{"noData":"No Data available for the Query"},"exporting":{"enabled":true},"plotOptions":{"series":{"dataLabels":{"enabled":false},"stacking":"normal"}},"legend":{"enabled":true,"align":"center","verticalAlign":"bottom","layout":"horizontal"},"credits":{"href":null,"enabled":false}}}`));
      this.byScientificSubdomainChartURL = this.sanitizer.bypassSecurityTrustResourceUrl(this.chartsURL + encodeURIComponent(`{"library":"HighCharts","chartDescription":{"queries":[{"name":"scientific subdomain","type":"bar","query":{"name":"resources.scientific_subdomain","parameters":[],"profile":"eosc"}}],"chart":{"backgroundColor":"#FFFFFFFF","borderColor":"#335cadff","borderRadius":0,"borderWidth":0,"plotBorderColor":"#ccccccff","plotBorderWidth":0},"title":{"text":"Scientific subdomains","align":"left","margin":50},"subtitle":{"text":"(top 10)","align":"left","margin":50},"yAxis":{"title":{"text":"resources"}},"xAxis":{"title":{"text":""}},"legend": {"enabled": false},"lang":{"noData":"No Data available for the Query"},"exporting":{"enabled":true},"plotOptions":{"series":{"dataLabels":{"enabled":false},"stacking":"normal"}},"legend":{"enabled":true,"align":"center","verticalAlign":"bottom","layout":"horizontal"},"credits":{"href":null,"enabled":false}}}`));
      this.byCategoryChartURL = this.sanitizer.bypassSecurityTrustResourceUrl(this.chartsURL + encodeURIComponent(`{"library":"HighCharts","chartDescription":{"queries":[{"name":"category","type":"bar","query":{"name":"resources.category","parameters":[],"profile":"eosc"}}],"chart":{"backgroundColor":"#FFFFFFFF","borderColor":"#335cadff","borderRadius":0,"borderWidth":0,"plotBorderColor":"#ccccccff","plotBorderWidth":0},"title":{"text":"Categories","align":"left","margin":50},"subtitle":{"text":"(top 10)","align":"left","margin":50},"yAxis":{"title":{"text":"resources"}},"xAxis":{"title":{"text":""}},"legend": {"enabled": false},"lang":{"noData":"No Data available for the Query"},"exporting":{"enabled":true},"plotOptions":{"series":{"dataLabels":{"enabled":false},"stacking":"normal"}},"legend":{"enabled":true,"align":"center","verticalAlign":"bottom","layout":"horizontal"},"credits":{"href":null,"enabled":false}}}`));
      this.bySubcategoryChartURL = this.sanitizer.bypassSecurityTrustResourceUrl(this.chartsURL + encodeURIComponent(`{"library":"HighCharts","chartDescription":{"queries":[{"name":"subcategory","type":"bar","query":{"name":"resources.subcategory","parameters":[],"profile":"eosc"}}],"chart":{"backgroundColor":"#FFFFFFFF","borderColor":"#335cadff","borderRadius":0,"borderWidth":0,"plotBorderColor":"#ccccccff","plotBorderWidth":0},"title":{"text":"Subcategories","align":"left","margin":50},"subtitle":{"text":"(top 10)","align":"left","margin":50},"yAxis":{"title":{"text":"resources"}},"xAxis":{"title":{"text":""}},"legend": {"enabled": false},"lang":{"noData":"No Data available for the Query"},"exporting":{"enabled":true},"plotOptions":{"series":{"dataLabels":{"enabled":false},"stacking":"normal"}},"legend":{"enabled":true,"align":"center","verticalAlign":"bottom","layout":"horizontal"},"credits":{"href":null,"enabled":false}}}`));

      this.classificationTabIsInitialised = true;
    }
  }

  private createAvailabilityContent() {

    if (!this.availabilityTabIsInitialised) {
      this.byAccessTypeChartURL = this.sanitizer.bypassSecurityTrustResourceUrl(this.chartsURL + encodeURIComponent(`{"library":"HighCharts","chartDescription":{"queries":[{"name":"access type","type":"pie","query":{"name":"resources.access_type","parameters":[],"profile":"eosc"}}],"chart":{"backgroundColor":"#FFFFFFFF","borderColor":"#335cadff","borderRadius":0,"borderWidth":0,"plotBorderColor":"#ccccccff","plotBorderWidth":0},"title":{"text":"Access types","align":"left","margin":50},"subtitle":{},"yAxis":{"title":{"text":"resources"}},"xAxis":{"title":{"text":""}},"legend": {"enabled": false},"lang":{"noData":"No Data available for the Query"},"exporting":{"enabled":true},"plotOptions":{"series":{"dataLabels":{"enabled":true},"stacking":"normal"}},"legend":{"enabled":true,"align":"center","verticalAlign":"bottom","layout":"horizontal"},"credits":{"href":null,"enabled":false}}}`));
      this.byAccessModeChartURL = this.sanitizer.bypassSecurityTrustResourceUrl(this.chartsURL + encodeURIComponent(`{"library":"HighCharts","chartDescription":{"queries":[{"name":"access mode","type":"pie","query":{"name":"resources.access_mode","parameters":[],"profile":"eosc"}}],"chart":{"backgroundColor":"#FFFFFFFF","borderColor":"#335cadff","borderRadius":0,"borderWidth":0,"plotBorderColor":"#ccccccff","plotBorderWidth":0},"title":{"text":"Access modes","align":"left","margin":50},"subtitle":{},"yAxis":{"title":{"text":"resources"}},"xAxis":{"title":{"text":""}},"legend": {"enabled": false},"lang":{"noData":"No Data available for the Query"},"exporting":{"enabled":true},"plotOptions":{"series":{"dataLabels":{"enabled":true},"stacking":"normal"}},"legend":{"enabled":true,"align":"center","verticalAlign":"bottom","layout":"horizontal"},"credits":{"href":null,"enabled":false}}}`));
      this.byOrderTypeChartURL = this.sanitizer.bypassSecurityTrustResourceUrl(this.chartsURL + encodeURIComponent(`{"library":"HighCharts","chartDescription":{"queries":[{"name":"order type","type":"pie","query":{"name":"resources.order_type","parameters":[],"profile":"eosc"}}],"chart":{"backgroundColor":"#FFFFFFFF","borderColor":"#335cadff","borderRadius":0,"borderWidth":0,"plotBorderColor":"#ccccccff","plotBorderWidth":0},"title":{"text":"Order types","align":"left","margin":50},"subtitle":{},"yAxis":{"title":{"text":"resources"}},"xAxis":{"title":{"text":""}},"legend": {"enabled": false},"lang":{"noData":"No Data available for the Query"},"exporting":{"enabled":true},"plotOptions":{"series":{"dataLabels":{"enabled":true},"stacking":"normal"}},"legend":{"enabled":true,"align":"center","verticalAlign":"bottom","layout":"horizontal"},"credits":{"href":null,"enabled":false}}}`));
      this.byTargetUsersChartURL = this.sanitizer.bypassSecurityTrustResourceUrl(this.chartsURL + encodeURIComponent(`{"library":"HighCharts","chartDescription":{"queries":[{"name":"target users","type":"pie","query":{"name":"resources.target_user","parameters":[],"profile":"eosc"}}],"chart":{"backgroundColor":"#FFFFFFFF","borderColor":"#335cadff","borderRadius":0,"borderWidth":0,"plotBorderColor":"#ccccccff","plotBorderWidth":0},"title":{"text":"Target users","align":"left","margin":50},"subtitle":{},"yAxis":{"title":{"text":"resources"}},"xAxis":{"title":{"text":""}},"legend": {"enabled": false},"lang":{"noData":"No Data available for the Query"},"exporting":{"enabled":true},"plotOptions":{"series":{"dataLabels":{"enabled":true},"stacking":"normal"}},"legend":{"enabled":true,"align":"center","verticalAlign":"bottom","layout":"horizontal"},"credits":{"href":null,"enabled":false}}}`));
      this.byLanguageChartURL = this.sanitizer.bypassSecurityTrustResourceUrl(this.chartsURL + encodeURIComponent(`{"library":"HighCharts","chartDescription":{"queries":[{"name":"language availability","type":"bar","query":{"name":"resources.language_availability","parameters":[],"profile":"eosc"}}],"chart":{"backgroundColor":"#FFFFFFFF","borderColor":"#335cadff","borderRadius":0,"borderWidth":0,"plotBorderColor":"#ccccccff","plotBorderWidth":0},"title":{"text":"Language availability","align":"left","margin":50},"subtitle":{"text":"(top 10)","align":"left","margin":50},"yAxis":{"title":{"text":"resources"}},"xAxis":{"title":{"text":""}},"legend": {"enabled": false},"lang":{"noData":"No Data available for the Query"},"exporting":{"enabled":true},"plotOptions":{"series":{"dataLabels":{"enabled":false},"stacking":"normal"}},"legend":{"enabled":true,"align":"center","verticalAlign":"bottom","layout":"horizontal"},"credits":{"href":null,"enabled":false}}}`));

      this.availabilityTabIsInitialised = true;
    }
  }

  private createMaturityContent() {

    if (!this.maturityTabIsInitialised) {
      this.byTRLChartURL = this.sanitizer.bypassSecurityTrustResourceUrl(this.chartsURL + encodeURIComponent(`{"library":"HighCharts","chartDescription":{"queries":[{"name":"trl","type":"pie","query":{"name":"resources.trl","parameters":[],"profile":"eosc"}}],"chart":{"backgroundColor":"#FFFFFFFF","borderColor":"#335cadff","borderRadius":0,"borderWidth":0,"plotBorderColor":"#ccccccff","plotBorderWidth":0},"title":{"text":"TRL","align":"left","margin":50},"subtitle":{},"yAxis":{"title":{"text":"resources"}},"xAxis":{"title":{"text":""}},"legend": {"enabled": false},"lang":{"noData":"No Data available for the Query"},"exporting":{"enabled":true},"plotOptions":{"series":{"dataLabels":{"enabled":true},"stacking":"normal"}},"legend":{"enabled":true,"align":"center","verticalAlign":"bottom","layout":"horizontal"},"credits":{"href":null,"enabled":false}}}`));
      this.byLifecycleChartURL = this.sanitizer.bypassSecurityTrustResourceUrl(this.chartsURL + encodeURIComponent(`{"library":"HighCharts","chartDescription":{"queries":[{"name":"lifecycle","type":"pie","query":{"name":"resources.life_cycle","parameters":[],"profile":"eosc"}}],"chart":{"backgroundColor":"#FFFFFFFF","borderColor":"#335cadff","borderRadius":0,"borderWidth":0,"plotBorderColor":"#ccccccff","plotBorderWidth":0},"title":{"text":"Lifecycle","align":"left","margin":50},"subtitle":{},"yAxis":{"title":{"text":"resources"}},"xAxis":{"title":{"text":""}},"legend": {"enabled": false},"lang":{"noData":"No Data available for the Query"},"exporting":{"enabled":true},"plotOptions":{"series":{"dataLabels":{"enabled":true},"stacking":"normal"}},"legend":{"enabled":true,"align":"center","verticalAlign":"bottom","layout":"horizontal"},"credits":{"href":null,"enabled":false}}}`));

      this.maturityTabIsInitialised = true;
    }
  }

  private createFunderContent() {

    if (!this.funderTabIsInitialised) {
      this.byFundingBodyChartURL = this.sanitizer.bypassSecurityTrustResourceUrl(this.chartsURL + encodeURIComponent(`{"library":"HighCharts","chartDescription":{"queries":[{"name":"funding body","type":"bar","query":{"name":"resources.funding_body","parameters":[],"profile":"eosc"}}],"chart":{"backgroundColor":"#FFFFFFFF","borderColor":"#335cadff","borderRadius":0,"borderWidth":0,"plotBorderColor":"#ccccccff","plotBorderWidth":0},"title":{"text":"Funding body","align":"left","margin":50},"subtitle":{"text":"(top 10)","align":"left","margin":50},"yAxis":{"title":{"text":"resources"}},"xAxis":{"title":{"text":""}},"legend": {"enabled": false},"lang":{"noData":"No Data available for the Query"},"exporting":{"enabled":true},"plotOptions":{"series":{"dataLabels":{"enabled":false},"stacking":"normal"}},"legend":{"enabled":true,"align":"center","verticalAlign":"bottom","layout":"horizontal"},"credits":{"href":null,"enabled":false}}}`));
      this.byFundingProgramChartURL = this.sanitizer.bypassSecurityTrustResourceUrl(this.chartsURL + encodeURIComponent(`{"library":"HighCharts","chartDescription":{"queries":[{"name":"funding programme","type":"bar","query":{"name":"resources.funding_programme","parameters":[],"profile":"eosc"}}],"chart":{"backgroundColor":"#FFFFFFFF","borderColor":"#335cadff","borderRadius":0,"borderWidth":0,"plotBorderColor":"#ccccccff","plotBorderWidth":0},"title":{"text":"Funding programme","align":"left","margin":50},"subtitle":{"text":"(top 10)","align":"left","margin":50},"yAxis":{"title":{"text":"resources"}},"xAxis":{"title":{"text":""}},"legend": {"enabled": false},"lang":{"noData":"No Data available for the Query"},"exporting":{"enabled":true},"plotOptions":{"series":{"dataLabels":{"enabled":false},"stacking":"normal"}},"legend":{"enabled":true,"align":"center","verticalAlign":"bottom","layout":"horizontal"},"credits":{"href":null,"enabled":false}}}`));

      this.funderTabIsInitialised = true;
    }
  }

  getDataFromAllProviders() {

    this.resourceService.getMapDistributionOfServices().subscribe(
      data => {
        this.geographicalDistributionMap = new Map();

        for (const [key, value] of Object.entries(data)) {
          this.geographicalDistributionMap.set(value.key.toLowerCase(), value.values);
        }
        this.setMapDistributionOfServices(data);
      },
      err => {
        this.errorMessage = 'An error occurred while retrieving geographical distribution of services for this provider. ' + err.error;
      }
    );
  }

  onMapSeriesClick(e) {
    this.selectedCountryName = e.point.name;
    this.selectedCountryServices = this.geographicalDistributionMap.get(e.point.options['hc-key']);

    UIkit.modal('#servicesPerCountryModal').show();
  }

  visitSelectedServicePage(serviceId: string) {
    UIkit.modal('#servicesPerCountryModal').hide();
    this.router.router.navigateByUrl('/service/' + serviceId);
  }

  setMapDistributionOfServices(mapData: any) {
    if (mapData) {
      this.mapDistributionOfServicesOptions = {
        chart: {
          map: mapWorld,
          // map: 'custom/world',
          height: (3 / 4 * 100) + '%', // 3:4 ratio
        },
        title: {
          // text: 'Countries serviced by ' + this.provider.name
          text: ''
        },
        colorAxis: {
          min: 0,
          stops: [
            [0, '#EFEFFF'],
            [0.5, '#7BB4EB'],
            [1, '#1f3e5b']
          ]
        },

        plotOptions: {
          series: {
            events: {
              click: function(e) {
                this.onMapSeriesClick(e);
              }.bind(this)
            }
          }
        },

        legend: {
          layout: 'vertical',
          align: 'left',
          verticalAlign: 'bottom'
        },
        // legend: {
        //   enabled: false
        // },
        mapNavigation: {
          enabled: true,
          enableMouseWheelZoom: false,
          buttonOptions: {
            verticalAlign: 'top'
          }
        },
        series: [{
          name: 'Country',
          // data: mapData.map(item => ([item.country, item])),
          data: mapData.map(item => ([item.key.toLowerCase(), item.values.length])),
          // data: mapData.map(item => ([item.key.toLowerCase(), item.values])),
          // data: mapData,
          // point: {
          //   events: {
          //     click: this.selectCountryOnMapDistribution
          //   }
          // },
          // tooltip: {
          //   useHTML: true,
          //   hideDelay: 1500,
          //   style: {
          //     pointerEvents: 'auto'
          //   },
          //   headerFormat: '',
          //   pointFormat: '{point.value.values.length}'
          // }
        }]
      };
    }
  }
}
