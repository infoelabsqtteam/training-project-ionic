import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { viewClassName } from '@angular/compiler';
import { AfterViewInit, Component, ElementRef, OnInit, QueryList, ViewChild } from '@angular/core';
import { AuthService, EnvService, StorageService } from '@core/ionic-core';
import { chartdata } from './data';

import { ChartDataset, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-charts',
  templateUrl: './charts.page.html',
  styleUrls: ['./charts.page.scss'],
})
export class ChartsPage implements AfterViewInit {
  // below is for static function
 
  public chartDatasets = {}
  public chartLabels = {};
  public chartOptions = {};
  public chartLegend = {};
  public chartType = {}; 

  charts = [
    {"name":"Reports"},
    {"name":"Report on Pie Chart"},
    {"name":"Report progress"},
    {"name":"Daily Report on Doughnut"},
    {"name":"Report on Polar Area Chart"},
    {"name":"Mixed Chart Report"}
    
  ];

  constructor(
  ) { }

  
  
  ngAfterViewInit(){
    

  }


  ngOnInit() {
    Object.keys(chartdata).forEach(key => {                    
      this.chartDatasets[key] = chartdata[key]['datasets']; 
      this.chartLabels[key] = chartdata[key]['label'];
      this.chartType[key]=chartdata[key]['type'];
      this.chartLegend[key]=chartdata[key]['legend'];
      this.chartOptions[key]=chartdata[key]['option'];
    })
    
  }

}
