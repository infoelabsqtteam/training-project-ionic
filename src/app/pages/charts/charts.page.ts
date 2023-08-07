import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnInit, QueryList, ViewChild } from '@angular/core';
import { Legend } from 'chart.js';
import { chartdata } from './data';


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
    {"name":"Reports Horizontal"},
    {"name":"Report on Pie Chart"},
    {"name":"Report progress"},
    {"name":"Report progress Y-axis"},
    {"name":"Daily Report on Doughnut"},
    {"name":"Report on Polar Area Chart"},
    {"name":"Mixed Chart Report"}
    
  ];

  constructor() { }
  
  
  ngAfterViewInit(){ }


  ngOnInit() {
    Object.keys(chartdata).forEach(key => {                    
      this.chartDatasets[key] = chartdata[key]['datasets']; 
      this.chartLabels[key] = chartdata[key]['label'];
      this.chartType[key]=chartdata[key]['type'];
      this.chartLegend[key]=chartdata[key]['legend'];
      this.chartOptions[key]=chartdata[key]['option'];
    })
    
  }

  //  (chartHover)="chartHovered($event[])"
  // chartHovered({ event, active }: { event: MouseEvent, active: {}[] }): void {
  //   console.log(event, active);
  // }
  
  //(chartClick)="chartClicked($event[])"
  // chartClicked({ event, active }: { event: MouseEvent, ac'tive: {}[] }): void {
  //   alert("Enent Clicked = " + event.type + "=" + " x = " + event.x  + " y = " + event.y);
  //   console.log(event, active);
  // }

  chartClicked(obj: any, i){
    alert("You clicked on Chart " + this.charts[i].name);
    console.log(this.charts[i]);
  }

  typeChanged(e, i){
    const on = e.detail.checked;
    this.chartType[i]=chartdata['type'];
    this.chartType[i] = on ? 'bar' : 'line';
  }

  hideLegend(i){
    const on = i.chartdata['legend'];
    console.log(on);
    this.chartLegend[i] = on ? 'false' : 'true';
    alert(this.chartLegend[i]);
    // this.chartLegend[i] = on ? 'false' : 'true';
    // console.log(this.chartLegend[i])
  }
}
