import { Component, OnInit } from '@angular/core';
import { Ng2GoogleChartsModule } from 'ng2-google-charts';
import { CoreUtilityService } from '@core/ionic-core';
// import { GoogleChartInterface } from 'ng2-google-charts/google-charts-interfaces';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  columnChart1:any;
  pieChart:any;
  tableChart:any;
  
  constructor(
    private coreUtilService:CoreUtilityService
  ) { 
    this.columnChart1 = {
      chartType: 'ColumnChart',
      dataTable: [
        ['City', '2010 Population'],
        ['Los Angeles, CA', 3792000],
        ['Chicago, IL', 2695000],
        ['Houston, TX', 2099000],
        ['Philadelphia, PA', 1526000]
      ],
      //opt_firstRowIsData: true,
      options: {
        title: 'Population of Largest U.S. Cities',
        height: 350,
        width:'100%',
        chartArea: { height: '300' },
        hAxis: {
          title: 'Total Population',
          minValue: 0
        },
        vAxis: {
          title: 'City'
        }
      },
    };

    this.pieChart = {
      chartType: 'PieChart',
      dataTable: [
        ['Task', 'Hours per Day'],
        ['Work', 11],
        ['Eat', 2],
        ['Commute', 6],
        ['Watch TV', 2],
        ['Sleep', 4]
      ],
      //opt_firstRowIsData: true,
      options: {
        title: 'Tasks',
        height: 200,
        width: '100%'
      },
    };

    this.tableChart = {
    chartType: 'Table',
  dataTable: [
    ['Department', 'Revenues', 'Another column', 'ColorFormat'],
    ['Shoes', 10700, -100, 100],
    ['Sports', -15400, 25, 500],
    ['Toys', 12500, 40, 800],
    ['Electronics', -2100, 889, 1000],
    ['Food', 22600, 78, 1100],
    ['Art', 1100, 42, 400]
  ],
  formatters: [
    {
      columns: [1, 2],
      type: 'NumberFormat',
      options: {
        prefix: '&euro;', negativeColor: 'red', negativeParens: true
      }
    },
    {
      columns: [3],
      type: 'ColorFormat',
      options: {
        ranges: [
          {from: 100, to: 900, fromBgColor: 'green', toBgColor: 'yellow'}
        ]
      }
    }
  ],
  options: {
    'title': 'Company',
    height: 300,
    width: '100%'}
}
  }
  

  ngOnInit() {
  }

  gotoPage(pageName){
    this.coreUtilService.gotoPage(pageName);
  }
}
