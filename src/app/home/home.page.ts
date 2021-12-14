import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { ProductSearchComponent } from '../component/product-search/product-search.component';
import { DataShareServiceService } from '../service/data-share-service.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  modal: any;
  selectedIndex= -1;


  list = [
    { 'title': 'Quotation', 'img': 'quot'},
    { 'title': 'Orders', 'img': 'orders'},
    { 'title': 'Invoice', 'img': 'invoice'},
    { 'title': 'Expenses', 'img': 'expenses'},
    { 'title': 'Leaves', 'img': 'leaves'},
    { 'title': 'Task', 'img': 'task'},
    { 'title': 'Leads', 'img': 'lead'},
    { 'title': 'Training', 'img': 'training'},
    { 'title': 'Inventory', 'img': 'inventory'},
    { 'title': 'Approvals', 'img': 'approval'},
    { 'title': 'Accounts', 'img': 'account'},
    { 'title': 'Vendors', 'img': 'vendor'},
    { 'title': 'My Team', 'img': 'team'},
    { 'title': 'Pollicies', 'img': 'pollicies'},
    { 'title': 'CRM', 'img': 'crm'}
  ];

  constructor(
    private modalController: ModalController,
    private router: Router,
    private dataShareService: DataShareServiceService
  ) {}


  ngOnInit() {}
  
  showCardTemplate(){
    //this.selectedIndex = index;
    this.router.navigate(['crm/contact']);
    // this.dataShareService.setcardData(card);
  }



  async openSearch() {
    this.modal = await this.modalController.create({
      component: ProductSearchComponent,
      componentProps: {
        "modalData": {},
        "headerVaue": ""
      }
    });
    this.modal.componentProps.modal = this.modal;
    return await this.modal.present();
  }
}