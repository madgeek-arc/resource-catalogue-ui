import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {environment} from '../../../../environments/environment';
import {ResourceService} from "../../../services/resource.service";
import {OpenAIREMetrics, PiwikInfo} from "../../../domain/eic-model";
import {DatasourceService} from "../../../services/datasource.service";
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";
import {pidHandler} from "../../../shared/pid-handler/pid-handler.service";

@Component({
  selector: 'app-datasource-metrics',
  templateUrl: './datasource-metrics.component.html',
})

export class DatasourceMetricsComponent implements OnInit {

  errorMessage = '';
  loadingMessage = '';

  datasourceId = '8ee09d8d-9e86-4e92-a9ed-fbf86b8c3ae6';
  openAIREMetrics: OpenAIREMetrics;

  viewsUrl: SafeResourceUrl;
  downloadsUrl: SafeResourceUrl;
  // piwik: PiwikInfo; //this.piwik.openaireId
  // openaireId = 'opendoar____::1106';
  // openaireId = 'opendoar____::307';
  openaireId = 'opendoar____::8e98d81f8217304975ccb23337bb5761';
  diagramsBaseURL = 'https://services.openaire.eu/stats-tool/';

  constructor(
    // private route: ActivatedRoute,
    private datasourceService: DatasourceService,
    private sanitizer: DomSanitizer,
    public pidHandler: pidHandler
  ) {}

  ngOnInit(): void {
    // this.serviceId = this.route.snapshot.paramMap.get('serviceId');

    // this.datasourceService.getOpenAIREMetrics(this.datasourceId).subscribe(
    //   res => {
    //     this.openAIREMetrics = res;
        this.getViewsUrl();
        this.getDownloadsUrl();
    //   },
    //   error => {},
    //   () => {
        this.openAIREMetrics = {
          pageViews: 12,
          totalDownloads: 60,
          totalOpenaireDownloads: 24,
          totalViews: 29,
          totalOpenaireViews: 22
        }
      // }
    // )
  }

  getViewsUrl () {

    const encodedURL = this.pidHandler.customEncodeURIComponent('{"library":"HighCharts","chartDescription":{"queries":[{"name":"Monthly views","type":"line","query":{"name":"usagestats.views.monthly", "parameters":["' + this.openaireId + '"], "profile":"OpenAIRE All-inclusive" }}],"chart":{"backgroundColor":"#FFFFFFFF","borderColor":"#335cadff","borderRadius":0,"borderWidth":0,"plotBorderColor":"#ccccccff","plotBorderWidth":0},"title":{"text":""},"subtitle":{},"yAxis":{"title":{"text":"Monthly views"}},"xAxis":{"title":{}},"lang":{"noData":"No Data available for the Query"},"exporting":{"enabled":false},"plotOptions":{"series":{"dataLabels":{"enabled":false}}},"legend":{"enabled":false},"credits":{"href":null,"enabled":true,"text":"Created by OpenAIRE via HighCharts"}}}');
    this.viewsUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`https://services.openaire.eu/stats-tool/chart?json=${encodedURL}`);

    // this.viewsUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
    //   `https://services.openaire.eu/stats-tool/chart?json={%22library%22:%22HighCharts%22,%22chartDescription%22:{%22queries%22:[{%22name%22:%22Monthly%20views%22,%22type%22:%22line%22,%22query%22:{%22name%22:%22usagestats.views.monthly%22,%20%22parameters%22:[%22opendoar____::8e98d81f8217304975ccb23337bb5761%22],%20%22profile%22:%22OpenAIRE%20All-inclusive%22%20}}],%22chart%22:{%22backgroundColor%22:%22#FFFFFFFF%22,%22borderColor%22:%22#335cadff%22,%22borderRadius%22:0,%22borderWidth%22:0,%22plotBorderColor%22:%22#ccccccff%22,%22plotBorderWidth%22:0},%22title%22:{%22text%22:%22%22},%22subtitle%22:{},%22yAxis%22:{%22title%22:{%22text%22:%22Monthly%20views%22}},%22xAxis%22:{%22title%22:{}},%22lang%22:{%22noData%22:%22No%20Data%20available%20for%20the%20Query%22},%22exporting%22:{%22enabled%22:false},%22plotOptions%22:{%22series%22:{%22dataLabels%22:{%22enabled%22:false}}},%22legend%22:{%22enabled%22:false},%22credits%22:{%22href%22:null,%22enabled%22:true,%22text%22:%22Created%20by%20OpenAIRE%20via%20HighCharts%22}}}`
    // );
  }

  getDownloadsUrl () {

    const encodedURL = this.pidHandler.customEncodeURIComponent('{"library":"HighCharts","chartDescription":{"queries":[{"name":"Monthly downloads","type":"line","query":{"name":"usagestats.downloads.monthly", "parameters":["' + this.openaireId + '"], "profile":"OpenAIRE All-inclusive" }}],"chart":{"backgroundColor":"#FFFFFFFF","borderColor":"#335cadff","borderRadius":0,"borderWidth":0,"plotBorderColor":"#ccccccff","plotBorderWidth":0},"title":{"text":""},"subtitle":{},"yAxis":{"title":{"text":"Monthly downloads"}},"xAxis":{"title":{}},"lang":{"noData":"No Data available for the Query"},"exporting":{"enabled":false},"plotOptions":{"series":{"dataLabels":{"enabled":false}}},"legend":{"enabled":false},"credits":{"href":null,"enabled":true,"text":"Created by OpenAIRE via HighCharts"}}}');
    this.downloadsUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`https://services.openaire.eu/stats-tool/chart?json=${encodedURL}`);

    // this.downloadsUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
    //   `${this.diagramsBaseURL}merge.php?com=query
    //   &data=[{"query":"dtsrcRepoDownloads","dtsrcName":"${this.openaireId}",
    //   "table":"","fields":[{"fld":"sum","agg":"sum","type":"chart","yaxis":1,"c":false}],
    //   "xaxis":{"name":"month","agg":"sum"},"group":"","color":"","type":"chart","size":30,
    //   "sort":"xaxis","xStyle":{"r":-30,"s":"0","l":"-","ft":"-","wt":"-"},"title":"","subtitle":"",
    //   "xaxistitle":"","yaxisheaders":["Monthly downloads"],"generalxaxis":"","theme":0,"in":[]}]
    //   &info_types=["spline"]&stacking=&steps=false&fontFamily=Courier&spacing=[5,0,0,0]
    //   &style=[{"color":"rgba(0, 0, 0, 1)","size":"18"},{"color":"rgba(0, 0, 0,1)","size":"18"},
    //   {"color":"000000","size":""},{"color":"000000","size":""}]&backgroundColor=rgba(255,255,255,1)
    //   &colors[]=rgba(124, 181, 236, 1)&colors[]=rgba(67, 67, 72, 1)&colors[]=rgba(144, 237, 125,1)
    //   &colors[]=rgba(247, 163, 92, 1)&colors[]=rgba(128, 133, 233,1)&colors[]=rgba(241, 92, 128, 1)
    //   &colors[]=rgba(228, 211, 84,1)&colors[]=rgba(43, 144, 143, 1)&colors[]=rgba(244, 91, 91,1)
    //   &colors[]=rgba(145, 232, 225,1)&xlinew=0&ylinew=1&legends=true&tooltips=true&persistent=false`
    // );
  }

}
