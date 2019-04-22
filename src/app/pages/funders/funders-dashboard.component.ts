import {Component, OnInit} from '@angular/core';
import {FunderService} from '../../services/funder.service';
import {FundersPage} from '../../domain/funders-page';
import {Funder} from '../../domain/eic-model';
import {map} from 'rxjs/operators';


@Component({
  selector: 'app-funders-dashboard',
  templateUrl: './funders-dashboard.component.html',
  styleUrls: ['./funders-dashboard.component.css']
})

export class FundersDashboardComponent implements OnInit {

  errorMessage: string;
  funder: FundersPage;
  selectedFunder: Funder;

  chartStats: any[] = [];

  constructor(private funderService: FunderService) {
  }

  ngOnInit(): void {
    this.getAllFunders();
    this.getChartData('all');
  }

  getAllFunders() {
    const quantity = '10000';
    this.funderService.getAllFunders(quantity).subscribe(
      res => this.funder = res,
      err => {
        this.errorMessage = 'Something went wrong';
        console.log(err);
      }
    );
  }

  getFunder(selection?: Funder) {
    this.chartStats = [];
    if (selection) {
      this.selectedFunder = selection;
      this.getChartData(selection.id);
    } else {
      this.selectedFunder = null;
      this.getChartData('all');
    }
  }

  marcSelection(name: string) {
    if (this.selectedFunder) {
      return this.selectedFunder.name === name;
    } else {
      return false;
    }
  }

  getChartData(funderId: string) {
    this.funderService.getFunderStats(funderId).pipe(map(data => {
      return Object.entries(data).map((key) => {
        Object.entries(key).map((innerKey) => {
          if (innerKey[1] !== 'NaN') {
            return {name: innerKey[0], y: innerKey[1]};
          }
        });
        return key;
      });
    })).subscribe(
      data => {
        for (let i = 0; i < data.length; i++) {
          const pieChartData: any[] = [];
          Object.entries(data[i][1]).forEach(entry => {
            pieChartData.push({name: entry[0], y: entry[1]});
          });
          this.setChartStats(pieChartData, i, data[i][0]);
        }
      }
    );
  }

  setChartStats(data: any, position: number, title: string) {
    if (data) {
      this.chartStats[position] = {
        chart: {
          plotBackgroundColor: null,
          plotBorderWidth: null,
          plotShadow: false,
          type: 'pie'
        },
        plotOptions: {
          pie: {
            size: '75%'
          }
        },
        title: {
          text: title
        },
        series: [{
          name: title + ' of funded services',
          data: data
        }]
      };
    }
  }

}
