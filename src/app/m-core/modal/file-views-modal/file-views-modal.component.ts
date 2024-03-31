import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { FileOpener } from '@capacitor-community/file-opener';
import { AppShareService, LoaderService, NotificationService, AppDownloadService } from '@core/ionic-core';
import { CommonFunctionService, DataShareService, ApiService, GridCommonFunctionService } from '@core/web-core';
import { ModalController, isPlatform } from '@ionic/angular';


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
  imageUrlList={};
  selectedIndex = -1;
  showPreview:boolean = false;
  showPrint:boolean = false;
  fieldType:string = '';

  @Input() id: string;
  @Input() modal: any;
  @Input() objectData: any;
  
  @Output() fileViewResponceData = new EventEmitter();
  @ViewChild('fileViewModal') fileViewModal: ElementRef;

  constructor(
    private commonFunctionService:CommonFunctionService,
    private dataShareService:DataShareService,
    private apiService:ApiService,
    private modalController: ModalController,
    private gridCommonFunctionService: GridCommonFunctionService,
    private appShareService: AppShareService,
    private loaderService: LoaderService,
    private notificationService: NotificationService,
    private appDownloadService: AppDownloadService
    ) {
      this.fileDownloadUrlSubscription = this.dataShareService.fileDownloadUrl.subscribe(data =>{
        if(this.showPreview){
          let splitUrl =data.split('?')[0];
          let imageName = splitUrl.split('/').pop();
          this.imageUrlList[imageName] = data;
        }else{
          this.setFileDownloadUrl(data);
        }
      })
  }

  // 
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
  ngOnDestroy(): void {
    // this.modalService.remove(this.id);
    if(this.fileDownloadUrlSubscription){
      this.fileDownloadUrlSubscription.unsubscribe();
    }
  }
  // Subscriber Functions Handling Start -------------------
  setFileDownloadUrl(fileDownloadUrl:string,fileName?:string){
    if(this.showPreview){
      this.downloadClick = fileName;
    }
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
  // Subscriber Functions Handling End -----------
  
  // Click Functions Handling Start-----------------------
  closeModal(role?:string){
    // this.fileViewModal.hide()
    this.dismissModal(role);
    this.data=[];
    this.editeMode=false;
    // this.editedColumne=false;
    this.gridColumns=[];
  }
  downloadFile(file){
    this.downloadClick = file.rollName;
    this.commonFunctionService.downloadFile(file);
  }
  // remove self from modal service when directive is destroyed
  dismissModal(role:string){
    if(this.modal && this.modal?.offsetParent['hasController']){
      this.modal?.offsetParent?.dismiss({'dismissed': true},role);
    }else{        
      this.modalController.dismiss({'dismissed': true},role,);
    }
  }
  accordionGroupChange(event:any){
    this.selectedIndex = event?.detail?.value;
  }
  async downloadImage(imageUrl: string, fileName: string) {
    this.loaderService.showLoader("blank");
    if(isPlatform('hybrid')){
      const response = await this.appDownloadService.saveFileAndGetFileUriFromUrl(imageUrl,fileName,'Documents');
      this.loaderService.hideLoader();
      if(response?.path){
        const confirm = await this.notificationService.confirmAlert(fileName, "Downloaded into Documents.  Do you want to open it ?", "Open");
        if(confirm == "confirm"){
          FileOpener.open({filePath:response?.path, openWithDefault:true,}).then( res => {
            console.log("File Opened");
          }).catch((e)=>{
            console.error("File Opening error ", JSON.stringify(e));
          })
        }
      }else{
        this.notificationService.presentToastOnBottom("Something went wrong Please retry.");
      }
    }else{
      this.setFileDownloadUrl(imageUrl,fileName);
    }
    this.loaderService.hideLoader();
  }
  async printFile(fileUrl:string,fileName:string){
    this.loaderService.showLoader("Preparing File to print");
    const response = await this.appDownloadService.saveFileAndGetFileUriFromUrl(fileUrl,fileName);
    let fileUri : any;
    if(response?.path && response?.status){
      fileUri = await this.appDownloadService.getFileUri(fileName);
      if(fileUri?.uri){
        await this.openShareDialogeForPrint(fileUri.uri,fileName);
      }
    }
    await this.loaderService.hideLoader();
    if(!response.status || !fileUri.status){
      this.notificationService.presentToastOnBottom("Something went wrong Please retry.");
    }
  }
  // Click Functions Handling End----------------
  
  // Dependency Functions Handling Start -------------------
  showModal(alert){
    this.field = alert?.field;
    this.coloumName = this.field?.label ? this.field.label : this.field?.field_label;
    this.data = JSON.parse(JSON.stringify(alert.data.data));
    this.showPreview = alert?.previewFile;
    this.showPrint = alert?.printFile;
    this.fieldType = alert?.field_type;
    if(alert.menu_name && alert.menu_name != null && alert.menu_name != undefined && alert.menu_name != ''){
      this.currentPage = alert.menu_name;
    } 
    if(alert.data?.gridColumns){
      this.gridColumns = JSON.parse(JSON.stringify(alert.data.gridColumns));
    }     
    // this.fileViewModal.show()
    if(this.showPrint){
      this.showPreview = true;
      if(this.gridColumns.length == 0){
        this.getImagesUrl(this.data);
      }
    }   
  }
  getImagesUrl(data:any){
    for (let index = 0; index < data.length; index++) {
      const element = data[index];
      const payload = {
        path: 'download',
        data: element
      }
      this.imageUrlList[element['rollName']] = '';
      this.apiService.DownloadFile(payload);    
    }
  }
  async openShareDialogeForPrint(fileUri,fileName){
    const canShare = await this.appShareService.checkDeviceCanShare();    
    await this.loaderService.hideLoader();
    if(canShare && fileUri){
      let shareOption = {
        title: fileName ? fileName : "Print File",
        text: "Here is the file you requested.",
        url: fileUri,
        dialogTitle: 'To print ' + fileName + ', please select print app'
      }
      this.appShareService.share(shareOption);
    }
  }
  // Dependency Functions Handling End ----------

  getddnDisplayVal(val) {
    return this.commonFunctionService.getddnDisplayVal(val);    
  }
  getValueForGrid(field,object){
    return this.gridCommonFunctionService.getValueForGrid(field,object);
  }

}
