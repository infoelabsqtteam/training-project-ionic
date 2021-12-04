import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { ToastController } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { from } from 'rxjs';
import { ModalComponent } from '../component/modal/modal.component';
import { AuthService, StorageService, LoaderService, CoreUtilityService, EnvService } from '@core/ionic-core';
import { SearchModalComponent } from '../component/search-modal/search-modal.component';

@Component({
  selector: 'app-module-list',
  templateUrl: './module-list.page.html',
  styleUrls: ['./module-list.page.scss'],
})
export class ModuleListPage implements OnInit {
  allModuleList: any;
  gridData: any;
  inValue = 0;
  myInput: string;
  // formModal:any;

  constructor(private authService: AuthService,
    private http: HttpClient, private router: Router, private storageService: StorageService,
    public toastController: ToastController, public modalController: ModalController,
    private loaderService: LoaderService, private coreUtilService:CoreUtilityService, private envService: EnvService) { }

  ngOnInit() {

    // this.storageService.getObject('authData').then((val)=>{
    //   if(val && val.idToken !=null){
    //     let obj = {
    //       key:val.idToken
    //     }

    //     var header = {
    //       headers: new HttpHeaders()
    //         .set('Authorization',  'Bearer '+val.idToken)
    //     }

    //     let api = this.coreUtilService.baseUrl('GET_USER_PERMISSION')
    //     this.http.post(api, obj, header).subscribe(
    //       respData => {
    //         if (respData && respData.authenticated === "true") {
    //           this.allModuleList = respData.modules;
    //         }
    //       },
    //       (err: HttpErrorResponse) => {
    //         console.log(err.error);
    //         console.log(err.name);
    //         console.log(err.message);
    //         console.log(err.status);
    //       }
    //     )
    //   }
    // });

    this.commonFunction();
  }

  async openModal(data) {
    const modal = await this.modalController.create({
      component: ModalComponent,
      componentProps: {
        "modalData": data,
        "lastName": "Welcome"
      }
    });
    modal.componentProps.modal = modal;

    return await modal.present();
  }
  async searchModal(data) {
    //alert(data.callHistory.length);
    const crList = [{ fName: "company_name", fValue: "", operator: "stwic" }]
    const modal = await this.modalController.create({
      component: SearchModalComponent,
      componentProps: {
        "modalData": { crList: crList, key1: "MCLR01", key2: "CRM", log: { userId: "Shyamk.babul@gmail.com", appId: "CRM", refCode: "MCLR01" }, pageNo: 0, pageSize: 100, value: "quotation_letter" },
        "headerVaue": "Search Quotation"
      }
    });
    modal.componentProps.modal = modal;
    modal.onDidDismiss()
      .then((data) => {
        console.log(data); // Here's your selected user!
      });
    return await modal.present();
  }
  GoToSelectedModule(module) {
    this.storageService.setAppId(module.name)
    const pageName = 'DASHBOARD';

    const menuSearchModule = { "value": "menu", key2: this.storageService.getAppId() }
    this.storageService.sendRequestToServer(menuSearchModule, "GET_CUSTOM_TEMPLATE")
  }

  commonFunction() {
    this.storageService.getObject('authData').then((val) => {
      if (val && val.idToken != null) {
        var header = {
          headers: new HttpHeaders()
            .set('Authorization', 'Bearer ' + val.idToken)
        }
        this.loaderService.showLoader(null);
        let obj = {
          crList: [],
          key1: "MCLR01",
          key2: "CRM",
          // log: {userId: "Shyamk.babul@gmail.com", appId: "CRM", refCode: "MCLR01"},
          pageNo: 0,
          pageSize: 100,
          value: "quotation_letter"
        }
        this.storageService.getUserLog().then((val) => {
          obj['log'] = val;
        })
        let api = this.envService.baseUrl('GET_GRID_DATA')
        this.http.post(api + '/' + 'null', obj, header).subscribe(
          respData => {
            this.loaderService.hideLoader();
            this.gridData = respData['data'];
          },
          (err: HttpErrorResponse) => {
            this.loaderService.hideLoader();
            console.log(err.error);
            // console.log(err.name);
            // console.log(err.message);
            // console.log(err.status);
          }
        )
      }
    })

  }
  // onDownload(data) {
  //   //this.storageService.presentToast('Download Start!!!')
  //   this.loaderService.showLoader("Downloading ...");
  //   this.storageService.getObject('authData').then((val) => {
  //     if (val && val.idToken != null) {

  //       let obj = {
  //         crList: [],
  //         key1: "MCLR01",
  //         key2: "CRM",
  //         // log: {userId: "Shyamk.babul@gmail.com", appId: "CRM", refCode: "MCLR01"},
  //         value: "quotation_letter",
  //         data: data
  //       }
  //       this.storageService.getUserLog().then((val) => {
  //         obj['log'] = val;
  //       })
  //       let api = appConstants.BaseUrl.getBaseUrl('GET_PDF')
  //       this.http.post(api + '/' + data._id, obj, {
  //         headers: new HttpHeaders()
  //           .set('Authorization', 'Bearer ' + val.idToken), responseType: 'arraybuffer' as 'json', observe: 'response' as 'body'
  //       }).subscribe(
  //         respData => {

  //           console.log(respData)
  //           if (respData) {
  //             var contentDisposition = respData['headers'].get('Content-Disposition');
  //             var filename = "";
  //             let matches = /filename="(.*?)"/g.exec(contentDisposition);
  //             if (matches != null && matches[1]) {
  //               filename = matches[1].replace(/['"]/g, '');
  //               filename = filename.substring(filename.indexOf("=") + 1, filename.length)
  //             }

  //             let link = document.createElement('a');
  //             link.setAttribute('type', 'hidden');

  //             const file = new Blob([respData['body']], { type: "application/pdf" });

  //             var reader = new FileReader();
  //             reader.readAsDataURL(file);
  //             reader.onloadend = function () {
  //               var base64data = reader.result as string;
  //               Capacitor.Plugins.Filesystem.writeFile({
  //                 data: base64data,
  //                 path: "directory/" + filename + ".pdf",
  //                 directory: FilesystemDirectory.Documents,
  //               }).then(c => {

  //               })
  //             }
  //             this.loaderService.hideLoader();
  //             this.storageService.presentToast('Download Completed!!!')



  //             // const url = window.URL.createObjectURL(file);
  //             // link.href = url;
  //             // link.download = filename;
  //             // document.body.appendChild(link);
  //             // link.click();
  //             // link.remove();
  //             // this.downloadPdfCheck = '';
  //           } else {
  //             this.loaderService.hideLoader();
  //           }
  //         },
  //         (err: HttpErrorResponse) => {
  //           this.loaderService.hideLoader();
  //           console.log(err.error);
  //           console.log(err.name);
  //           console.log(err.message);
  //           console.log(err.status);
  //         }
  //       )

  //     }

  //   })

  // }

  gotoPage(selectedPage) {
    this.coreUtilService.gotoPage(selectedPage);
  }

  search(myInput) {

    this.storageService.getObject('authData').then((val) => {
      if (val && val.idToken != null) {
        var header = {
          headers: new HttpHeaders()
            .set('Authorization', 'Bearer ' + val.idToken)
        }
        let searchObj = {
          crList: [{
            fName: "company_name",
            fValue: myInput,
            operator: "stwic"
          }],
          key1: "MCLR01",
          key2: "CRM",
          // log: {userId: "Shyamk.babul@gmail.com", appId: "CRM", refCode: "MCLR01"},
          pageNo: 0,
          pageSize: 50,
          value: "quotation_letter",
        }
        this.storageService.getUserLog().then((val) => {
          searchObj['log'] = val;
        })
        let api = this.envService.baseUrl('GET_GRID_DATA')
        this.http.post(api + '/null', searchObj, header).subscribe(
          respData => {
            this.gridData = respData['data'];
          },
          (err: HttpErrorResponse) => {
            console.log(err.error);
            console.log(err.name);
            console.log(err.message);
            console.log(err.status);
          }
        );
      }
    })

  }
  onClose(myInput) {
    this.commonFunction();
  }

  onChangeValue(myInput) {
    this.inValue = myInput.length;
    if (this.inValue <= 0) {
      this.commonFunction();
    }
  }


}
