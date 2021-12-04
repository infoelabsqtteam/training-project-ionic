import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController, ModalController } from '@ionic/angular';
import { UpdateTaskComponent } from 'src/app/component/update-task/update-task.component';
import { AuthService, StorageService, LoaderService, CoreUtilityService, EnvService } from '@core/ionic-core';

@Component({
  selector: 'app-task',
  templateUrl: './task.page.html',
  styleUrls: ['./task.page.scss'],
})
export class TaskPage implements OnInit {
  taskList: any = [];

  constructor(
     
    private authService: AuthService,
    private http: HttpClient, 
    private router: Router, 
    private storageService: StorageService,
    public toastController: ToastController, 
    public modalController: ModalController,
    private loaderService: LoaderService,
    private coreUtilService:CoreUtilityService,
    private envService:EnvService
  ) { }

  ngOnInit() {
  }
  ionViewWillEnter() {
    this.getTask();

  }
  getTask() {
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
          value: "task_master"
        }
        this.storageService.getUserLog().then((val) => {
          obj['log'] = val;
        })
        let api = this.envService.baseUrl('GET_GRID_DATA')
        this.http.post(api + '/' + 'null', obj, header).subscribe(
          respData => {
            this.loaderService.hideLoader();
            this.taskList = respData['data'];
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
  async openModal(data) {
    const modal = await this.modalController.create({
      component: UpdateTaskComponent,
      componentProps: {
        "modalData": data,
        "lastName": "Welcome"
      }
    });
    modal.componentProps.modal = modal;

    return await modal.present();
  }


}
