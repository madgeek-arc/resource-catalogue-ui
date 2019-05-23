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
  loading: boolean;

  chartStats: any[] = [];
  displayWidth: any[] = [];

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
        // console.log(err);
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

  markSelection(name: string) {
    if (this.selectedFunder) {
      return this.selectedFunder.name === name;
    } else {
      return false;
    }
  }

  getChartData(funderId: string) {
    // this.setCategoriesStats(funderId); // get bar charts, optimize this for deploy
    this.loading = true;
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
        this.loading = false;
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
    this.displayWidth[position] = true;
    if (title === 'Categories' || title === 'Subcategories' || title === 'Providers') {
      const barNames = [];
      const values = [];
      for (const i in data) {
        barNames.push(data[i].name);
        values.push(data[i].y);
      }
      // console.log(barNames);
      // console.log(values);
      let type = 'bar';
      if (title === 'Subcategories' || title === 'Providers') {
        type = 'column';
        if (barNames.length >= 15) {
          this.displayWidth[position] = false;
        }
      }

      this.chartStats[position] = {
        chart: {
          type: type
        },
        title: {
          text: title
        },
        xAxis: {
          categories: barNames,
          title: {
            text: null
          }
        },
        yAxis: {
          min: 0,
          title: {
            text: 'Number of services',
            align: 'high'
          },
          labels: {
            overflow: 'justify'
          }
        },
        plotOptions: {
          bar: {
            dataLabels: {
              enabled: true
            },
            pointWidth: 10,
          },
          column: {
            pointWidth: 10,
          }
        },
        series: [{
          name: 'Services',
          data: values
        }]
      };

    } else if (data) {
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
