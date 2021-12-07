import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Chart,
  ArcElement,
  LineElement,
  BarElement,
  PointElement,
  BarController,
  BubbleController,
  DoughnutController,
  LineController,
  PieController,
  PolarAreaController,
  RadarController,
  ScatterController,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  RadialLinearScale,
  TimeScale,
  TimeSeriesScale,
  Decimation,
  Filler,
  Legend,
  Title,
  Tooltip} from 'chart.js';
  
  Chart.register(
    ArcElement,
    LineElement,
    BarElement,
    PointElement,
    BarController,
    BubbleController,
    DoughnutController,
    LineController,
    PieController,
    PolarAreaController,
    RadarController,
    ScatterController,
    CategoryScale,
    LinearScale,
    LogarithmicScale,
    RadialLinearScale,
    TimeScale,
    TimeSeriesScale,
    Decimation,
    Filler,
    Legend,
    Title,
    Tooltip
  );

@Component({
  selector: 'app-charts',
  templateUrl: './charts.page.html',
  styleUrls: ['./charts.page.scss'],
})
export class ChartsPage implements AfterViewInit {
  @ViewChild('barCanvas') private barCanvas: ElementRef;
  @ViewChild('lineCanvas') private lineCanvas: ElementRef;
  @ViewChild('doughnutCanvas') private doughnutCanvas: ElementRef;
  @ViewChild('pieCanvas') private pieCanvas: ElementRef;
  @ViewChild('polarAreaCanvas') private polarAreaCanvas: ElementRef;

  barChart: any;
  lineChart: any;
  doughnutChart: any;
  pieChart: any;
  polarAreaChart: any;

  constructor(
    
  ) { }

  ngAfterViewInit(){
    this.barChartMethod();
    this.lineChartMethod();
    this.doughnutChartMethod();
    this.pieChartMethod();
    this.polarAreatMethod();
  }

  barChartMethod() {
    this.barChart = new Chart(this.barCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: ['English', 'Maths', 'Science', 'Sanskrit', 'Physical', 'Social'],
        datasets: [{
          label: 'Report Card',
          data: [98, 90, 70, 60, 75, 80],
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)'
          ],
          borderColor: [
            'rgba(255,99,132,1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  lineChartMethod() {
    this.lineChart = new Chart(this.lineCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'November', 'December'],
        datasets: [
          {
            label: 'Sell per Month',
            fill: false,
            tension: 0.1,
            backgroundColor: 'rgba(75,192,192,0.4)',
            borderColor: 'rgba(75,192,192,1)',
            borderCapStyle: 'butt',
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: 'miter',
            pointBorderColor: 'rgba(75,192,192,1)',
            pointBackgroundColor: '#fff',
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: 'rgba(75,192,192,1)',
            pointHoverBorderColor: 'rgba(220,220,220,1)',
            pointHoverBorderWidth: 2,
            pointRadius: 1,
            pointHitRadius: 10,
            data: [65, 59, 80, 81, 56, 55, 40, 10, 5, 50, 10, 15],
            spanGaps: false,
          },
          {
            label: 'Output per Month',
            fill: false,
            tension: 0.1,
            backgroundColor: 'rgba(107,186,240,0.4)',
            borderColor: 'rgba(107,186,240,1)',
            borderCapStyle: 'butt',
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: 'miter',
            pointBorderColor: 'rgba(107,186,240,1)',
            pointBackgroundColor: '#fff',
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: 'rgba(107,186,240,1)',
            pointHoverBorderColor: 'rgba(220,220,220,1)',
            pointHoverBorderWidth: 2,
            pointRadius: 1,
            pointHitRadius: 10,
            data: [40, 55, 65, 78, 55, 30, 60, 45, 30, 70, 80, 95],
            spanGaps: false,
          }

        ]
      }
    });
  }

  doughnutChartMethod() {
    this.doughnutChart = new Chart(this.doughnutCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: [
          'Blue',
          'Yellow',
          'Red'
        ],
        datasets: [{
          label: 'My First Dataset',
          data: [300, 50, 100],
          backgroundColor: [
            'rgb(54, 162, 235)',
            'rgb(255, 205, 86)',
            'rgb(255, 99, 132)'
          ],
          hoverBackgroundColor: [
            '#36A2EB',
            '#FFCE56',
            '#FF6384'
            
          ]
        }]
      }
    });
  }

  pieChartMethod() {
    this.pieChart = new Chart(this.pieCanvas.nativeElement, {
      type: 'pie',
      data: {
        labels: ['BJP', 'Congress', 'AAP', 'CPM', 'SP'],
        datasets: [{
          label: '# of Votes',
          data: [50, 29, 15, 10, 7],
          backgroundColor: [
            'rgba(255, 159, 64, 0.2)',
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)'
          ],
          hoverBackgroundColor: [
            '#FFCE56',
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#FF6384'
          ]
        }]
      }
    });
  }

  polarAreatMethod() {
    this.polarAreaChart = new Chart(this.polarAreaCanvas.nativeElement, {
      type: 'polarArea',
      data: {
        labels: ['BJP', 'Congress', 'AAP', 'CPM', 'SP'],
        datasets: [{
          label: 'Votes Datasets',
          data: [11, 16, 7, 3, 14],
          backgroundColor: [
            'rgb(255, 99, 132, .9)',
            'rgb(75, 192, 192, .9)',
            'rgb(255, 205, 86, .9)',
            'rgb(201, 203, 207, .9)',
            'rgb(54, 162, 235, .9)'
          ],
          hoverBackgroundColor: [
            '#FFCE56',
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#FF6384'
          ]
        }]
      }
    });
  }


  // ngOnInit() {
  // }

}
