import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
// import { ModalDirective } from 'angular-bootstrap-md';
import { CommonFunctionService, DataShareService, ApiService, ModelService } from '@core/web-core';
import { ModalController } from '@ionic/angular';


@Component({
  selector: 'app-file-views-modal',
  templateUrl: './file-views-modal.component.html',
  styleUrls: ['./file-views-modal.component.css']
})
export class FileViewsModalComponent implements OnInit {

  public coloumName:any = '';
  public data=[];  
  gridColumns:any=[];  
  currentPage: any = '';
  field:any={};
  downloadClick:any='';
  fileDownloadUrlSubscription;
  editeMode:boolean;
  imgurl:string='';

  @Input() id: string;
  @Input() modal: any;
  @Input() objectData: any;
  
  @Output() fileViewResponceData = new EventEmitter();
  @ViewChild('fileViewModal') fileViewModal: ElementRef;

  constructor(
    private modalService: ModelService, 
    private el: ElementRef,
    private commonFunctionService:CommonFunctionService,
    private dataShareService:DataShareService,
    private apiService:ApiService,
    private modalController: ModalController
    ) {
      this.fileDownloadUrlSubscription = this.dataShareService.fileDownloadUrl.subscribe(data =>{
        this.setFileDownloadUrl(data);
      })
     }

  ngOnInit(): void {
    let modal = this;
    // ensure id attribute exists
    if (!this.modal && !this.modal?.offsetParent['hasController']) {
        console.error('modal must have an id');
        return;
    }
    // add self (this modal instance) to the modal service so it's accessible from controllers
    // this.modalService.add(this);

    this.showModal(this.objectData);
  }
  setFileDownloadUrl(fileDownloadUrl){
    if (fileDownloadUrl != '' && fileDownloadUrl != null && this.downloadClick != '') {
      this.imgurl = fileDownloadUrl;
      let link = document.createElement('a');
      link.setAttribute('type', 'hidden');
      link.href = fileDownloadUrl;
      link.download = this.downloadClick;
      document.body.appendChild(link);
      link.click();
      link.remove();
      this.downloadClick = '';
      this.apiService.ResetDownloadUrl();
    }
  }
  // remove self from modal service when directive is destroyed
  ngOnDestroy(): void {
    // this.modalService.remove(this.id);
    if(this.fileDownloadUrlSubscription){
      this.fileDownloadUrlSubscription.unsubscribe();
    }
  }
  showModal(alert){
    this.field = alert.field;
    this.coloumName = this.field.label ? this.field.label : this.field.field_label;
    this.data = JSON.parse(JSON.stringify(alert.data.data));
    
    if(alert.menu_name && alert.menu_name != null && alert.menu_name != undefined && alert.menu_name != ''){
      this.currentPage = alert.menu_name;
    } 
    if(alert.data?.gridColumns){
      this.gridColumns = JSON.parse(JSON.stringify(alert.data.gridColumns));
    }     
    // this.fileViewModal.show()    
  }
  closeModal(role?:string){
    // this.fileViewModal.hide()
    this.dismissModal(role);
    this.data=[];
    this.editeMode=false;
    // this.editedColumne=false;
    this.gridColumns=[];
  }
  getddnDisplayVal(val) {
    return this.commonFunctionService.getddnDisplayVal(val);    
  }
  getValueForGrid(field,object){
    return this.gridCommonFunctionService.getValueForGrid(field,object);
  }
  downloadFile(file){
    this.downloadClick = file.rollName;
    this.commonFunctionService.downloadFile(file);
  }

  dismissModal(role:string){
    if(this.modal && this.modal?.offsetParent['hasController']){
      this.modal?.offsetParent?.dismiss({'dismissed': true},role);
    }else{        
      this.modalController.dismiss({'dismissed': true},role,);
    }
  }

}
