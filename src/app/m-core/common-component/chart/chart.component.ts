import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { ApiService, DataShareService, RestService } from '@core/ionic-core';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
})
export class ChartComponent implements OnInit{

  @Input() isShow: string;
  public chartType:any = {};
  public chartDatasets:any = {};
  public chartLabels:any = {};
  public chartColors:any = {};
  public chartOptions:any = {};
  public chartLegend:any = {};
  public chartTitle:any = {};

  checkGetDashletData:boolean=true;
  dashletData:any={};
  pageNumber:any=1;
  itemNumOfGrid: any = 12;
  elements:any=[];  
  staticData: any = {};
  copyStaticData:any={};

  gridDataSubscription:any;
  staticDataSubscription:any;
  dashletDataSubscription:any;

  filterValue:any = [];
  filteredDashboardData:any = [];
  filterdata = '';
  
  total: number;
  showfilter:boolean = false;
  

  constructor(
    private restService: RestService,
    private apiService:ApiService,
    private dataShareService:DataShareService,

  ) {
    // this.onLoadSubscribe();
    this.gridDataSubscription = this.dataShareService.dashletMaster.subscribe(data =>{
      this.setGridData(data);
      console.log("setGridData: ",data);
    })
    this.staticDataSubscription = this.dataShareService.staticData.subscribe(data =>{
      this.setStaticData(data);
      console.log("setStaticData: ",data);
    })
    this.dashletDataSubscription = this.dataShareService.dashletData.subscribe(data =>{
      this.setDashLetData(data);
    }) 
   }

   ionViewWillEnter(){}
   ionViewDidEnter(){}

   onLoadSubscribe(){
    this.gridDataSubscription = this.dataShareService.dashletMaster.subscribe(data =>{
      this.setGridData(data);
      console.log("setGridData: ",data);
    })
    this.staticDataSubscription = this.dataShareService.staticData.subscribe(data =>{
      this.setStaticData(data);
      console.log("setStaticData: ",data);
    })
    this.dashletDataSubscription = this.dataShareService.dashletData.subscribe(data =>{
      this.setDashLetData(data);
    }) 
   }
  
   setChartData(chartData){
    if (chartData) {
       console.log(chartData);
    }
  }
  
  ngAfterViewInit(){ }

  ngOnInit() {
    this.getDataForGrid();
    this.getChartList();    
  }
  ngOnChanges(changes: SimpleChanges) {
    if(this.isShow){
      this.getPage(1)
      this.getChartList();
      this.checkGetDashletData = true;
    }
  }
  ngOnDestroy(){
    this.checkGetDashletData = false;
    if(this.gridDataSubscription){
      this.gridDataSubscription.unsubscribe();
    }
    if(this.staticDataSubscription){
      this.staticDataSubscription.unsubscribe();
    }
    if(this.dashletDataSubscription){
      this.dashletDataSubscription.unsubscribe();
    }
  }

  setDashLetData(dashletData:any){
    const dashlet = Object.keys(dashletData)
    if (dashletData && dashlet.length > 0) {
      this.dashletData = dashletData;
      Object.keys(this.dashletData).forEach(key => {                    
        this.chartDatasets[key] = JSON.parse(JSON.stringify(this.dashletData[key]['dataSets']));  
        this.chartLabels[key] = JSON.parse(JSON.stringify(this.dashletData[key]['label']));
        this.chartType[key]=JSON.parse(JSON.stringify(this.dashletData[key]['type']));
        this.chartColors[key]=JSON.parse(JSON.stringify(this.dashletData[key]['colors']));
        this.chartLegend[key]=JSON.parse(JSON.stringify(this.dashletData[key]['legend']));
        this.chartOptions[key]=JSON.parse(JSON.stringify(this.dashletData[key]['options']));
        if(this.dashletData[key]['title']){
          this.chartTitle[key]=JSON.parse(JSON.stringify(this.dashletData[key]['title']));
        }        
      })
    }
  }

  setGridData(gridData?:any){
    if (gridData.data && gridData.data.length > 0) {
      this.elements = JSON.parse(JSON.stringify(gridData.data));
      this.total = gridData.data_size;
      this.filteredDashboardData = JSON.parse(JSON.stringify(this.elements));
      if(this.checkGetDashletData && this.elements.length > 0){
        this.checkGetDashletData = false;
        if(this.elements.length > 0){
          this.getDashletData(this.elements);
        }            
      }          
    } else {
      this.elements = [];
    }
  }

  getDashletData(elements){
    if(elements && elements.length > 0){
      let payloads = [];
      //let value = this.dashboardFilter.getRawValue();
      elements.forEach(element => {
        const fields = element.fields;        
        //const filterData = this.getSingleCardFilterValue(element,value);
        let crList = [];
        // if(fields && fields.length > 0){
        //   crList = this.restService.getfilterCrlist(fields,filterData);
        // }        
        let object = {}
        // if(filterData){
        //   object = filterData;
        // }
        const data = {
          "data": object,
          "crList":crList
        }
        const payload={
          "_id" : element._id,
          "data" : data
        }
        payloads.push(payload);
      });
      if(payloads && payloads.length > 0 && payloads.length == elements.length){
        this.apiService.GetDashletData(payloads);
      }      
    }
  }

  setStaticData(staticData?:any){
    if (staticData) {
      this.staticData = staticData;
      Object.keys(this.staticData).forEach(key => {        
        this.copyStaticData[key] = JSON.parse(JSON.stringify(this.staticData[key]));
      }) 
    }
  }

  getDataForGrid(Criteria?:any){    
    const data = this.restService.getPaylodWithCriteria('dashlet_master','',Criteria,'');
    data['pageNo'] = this.pageNumber - 1;
    data['pageSize'] = this.itemNumOfGrid; 
    const getFilterData = {
      data: data,
      path: null
    }
    this.apiService.getDashletMaster(getFilterData)
  }
  getPage(page: number,criteria?:any) {
    let Criteria:any = [];
    if(criteria && criteria.length > 0){
      Criteria = criteria;
    }
    this.pageNumber = page;
    this.getDataForGrid(Criteria);
    this.checkGetDashletData = true;
  }
  getChartList(){
    const payload = this.restService.getPaylodWithCriteria('dashlet_master','chart_list',[],'');
    this.apiService.getStatiData([payload]);
  }

  
}
