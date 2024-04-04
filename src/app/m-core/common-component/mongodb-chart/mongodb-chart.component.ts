import { Component, OnInit, AfterViewInit, Input, SimpleChanges } from '@angular/core';
import ChartsEmbedSDK from "@mongodb-js/charts-embed-dom";
import { ModelService, AppDownloadService } from '@core/ionic-core';
import { ChartFilterComponent } from '../../modal/chart-filter/chart-filter.component';
import { ModalController, isPlatform } from '@ionic/angular';
import { ApiService, CommonFunctionService, DataShareService, ChartService, StorageService, ApiCallService } from '@core/web-core';

@Component({
  selector: 'app-mongodb-chart',
  templateUrl: './mongodb-chart.component.html',
  styleUrls: ['./mongodb-chart.component.scss'],
})
export class MongodbChartComponent implements OnInit,AfterViewInit {

  chartIdList:any = [];
  createdChartList:any=[];
  accessToken:string="";
  @Input() showMongoChart:boolean;
  pageNumber:any=1;
  itemNumOfGrid: any = 12;
  gridDataSubscription:any;
  darkTheme:any={};
  headertitle:string='Charts';
  noOfItems:any = [6,9,12,15,18,21,24];  
  staticData: any = {};
  staticDataSubscription:any;

  constructor(
    private dataShareService:DataShareService,
    private storageService: StorageService,
    private apiService:ApiService,
    private chartService:ChartService,
    private modalController: ModalController,
    private modelService: ModelService,
    private appDownloadService: AppDownloadService,
    private apiCallService: ApiCallService
  ){
    // this.getMongoChartList([]);
    // this.accessToken = this.storageService.GetIdToken();
    this.staticDataSubscription = this.dataShareService.staticData.subscribe(data =>{
        this.setStaticData(data);
    })
    this.gridDataSubscription = this.dataShareService.mongoDbChartList.subscribe(data =>{
      const chartData = data.data;
      if(chartData && chartData.length > 0){
        this.chartIdList = chartData;
        setTimeout(() => {
          this.populateMongodbChart();
        }, 100);
      }
    })      
  }

  // Ionic LifeCycle Function Handling Start--------------------
  ionViewWillEnter(){
    this.getMongoChartList([]);
    this.getChartList();
  }
  // Ionic LifeCycle Function Handling End--------------------

  // Angular LifeCycle Function Handling Start--------------------
  ngOnInit() {
    this.itemNumOfGrid = 12;
    this.accessToken = this.storageService.GetIdToken();
  }
  ngAfterViewInit(){
     //this.populateMongodbChart();     
  }
  ngOnChanges(changes: SimpleChanges): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    if(this.showMongoChart){
      setTimeout(() => {
        this.populateMongodbChart();
      }, 100);
    }
  }
  ngOnDestroy(){
    if(this.gridDataSubscription){
      this.gridDataSubscription.unsubscribe();
    }
    if(this.staticDataSubscription){
      this.staticDataSubscription.unsubscribe();
    }
  }
  // Angular LifeCycle Function Handling End--------------------

  getMongoChartList(Criteria){
    const data = this.apiCallService.getPaylodWithCriteria('mongo_dashlet_master','',Criteria,'');
      data['pageNo'] = this.pageNumber - 1;
      data['pageSize'] = this.itemNumOfGrid; 
      const getFilterData = {
        data: data,
        path: null
      }
      this.apiService.getMongoDashletMster(getFilterData);
  }
  populateMongodbChart(){
    if(this.accessToken != "" && this.accessToken != null){      
      let height = '350px';
      if(this.chartIdList && this.chartIdList.length > 0){        
        this.createdChartList = [];
        for (let i = 0; i < this.chartIdList.length; i++) {
          const url = this.chartIdList[i].chartUrl;
          if(url && url != ''){
            const sdk = new ChartsEmbedSDK({
              baseUrl: url, // Optional: ~REPLACE~ with the Base URL from your Embed Chart dialog
              getUserToken: () => this.accessToken
            });
            let chart = this.chartIdList[i];
            const id = chart.chartId;
            const idRef = document.getElementById(id);
            if(chart && chart.height && chart.height != ""){
              height = chart.height;
            }
            if(idRef){
              let cretedChart = sdk.createChart({
                chartId: id, // Optional: ~REPLACE~ with the Chart ID from your Embed Chart dialog
                height: height
              });
              this.createdChartList[id] = cretedChart;
              cretedChart
              .render(idRef)
              .catch(() =>
              console.log('Chart failed to initialise')
              // window.alert('Chart failed to initialise')
              );
            }
          }
        }        
      }
    }
  }
  getChartList(){
    const payload = this.apiCallService.getPaylodWithCriteria('mongo_dashlet_master','chart_list',[],'');
    this.apiService.getStatiData([payload]);
  }
  setStaticData(staticDatas){
    if(Object.keys(staticDatas).length > 0) {
      Object.keys(staticDatas).forEach(key => {  
        let staticData = {};
        staticData[key] = staticDatas[key];  
        if(key && key != 'null' && key != 'FORM_GROUP' && key != 'CHILD_OBJECT' && key != 'COMPLETE_OBJECT' && key != 'FORM_GROUP_FIELDS'){
          if(staticData[key]) { 
            this.staticData[key] = JSON.parse(JSON.stringify(staticData[key]));
          }
        } 
      });
    }
  }
  filterModel(data:any,filter:any,index:number){
    let object = {
      'dashboardItem' : data,
      'dashletData' : "",
      'filter':filter,
      'index' : index
    }
    // this.chartFilterModal(object);
    this.openModal(ChartFilterComponent,object);
    // this.modelService.open('chart-filter',object);
    
  }
  openModal(component:any, objectData:object){
    this.modelService.openModal(component,objectData).then((data:any) => {
      if(data && data.role == 'closed'){
        console.log("ModalIs",data.role);
      }
    });
  }
  async chartFilterModal(data:any){
    // this.showfilter = true;
    const modal = await this.modalController.create({
      component: ChartFilterComponent,
      cssClass: 'my-custom-modal-css',
      componentProps: {
        'dashboardItem' : data.dashboardItem,
        'dashletData' : data.dashletData,
        'filter':data.filter,
        'selectedIndex': data.index,
        'staticData': this.staticData
      },
      showBackdrop:true,
      backdropDismiss:false,
    });
    modal.componentProps.modal = modal;
    modal.onDidDismiss()
        .then((data) => {
          console.log(data.role);
        })
    return await modal.present();
  }
  async download(object){
    let chartId = object.chartId;
    let chart = this.createdChartList[chartId];    
    let blobData:any = await this.chartService.getDownloadData(chart,object);
    if(isPlatform('hybrid')){
      const response:any = await this.appDownloadService.downloadBlobData(blobData.url, blobData.name);
    }else{
      this.chartService.downlodBlobData(blobData.url, blobData.name);
    }
  }  
  changeTheme(object,value){
    let chartId = object.chartId;
    let chart = this.createdChartList[chartId];
    if(value){
      chart.setTheme("dark");
    }else{
      chart.setTheme("light");
    }
  }
  selectNoOfItem(){
    this.getPage(1);
  }
  getPage(page: number,criteria?:any) {
    let Criteria:any = [];
    if(criteria && criteria.length > 0){
      Criteria = criteria;
    }
    this.pageNumber = page;
    this.getMongoChartList(Criteria);
    // this.checkGetDashletData = true;
  }
  // Pull from Top for Do refreshing or update card list 
  doRefresh(event:any) {
      console.log('Begin doRefresh async operation');
      setTimeout(() => {
        event.target.complete();
        this.getMongoChartList([]);
      }, 3000);
  }

}

