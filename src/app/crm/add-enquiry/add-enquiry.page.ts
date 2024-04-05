import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';  


@Component({
  selector: 'app-add-enquiry',
  templateUrl: './add-enquiry.page.html',
  styleUrls: ['./add-enquiry.page.scss'],
})
export class AddEnquiryPage implements OnInit {
    disabled = true;
  constructor(public alertCtrl: AlertController) { }

  ngOnInit() {
  }

  isItemAvailable = false;
     items = [];
     initializeItems(){
         this.items = ["Ram","gopi", "dravid"];
     }

     getItems(ev: any) {
         this.initializeItems();
         const val = ev.target.value;
         if (val && val.trim() !== '') {
             this.isItemAvailable = true;
             this.items = this.items.filter((item) => {
                 return (item.toLowerCase().indexOf(val.toLowerCase()) > -1);
             })
         } else {
             this.isItemAvailable = false;
         }
     }

     async showAlert() {  
        const alert = await this.alertCtrl.create({  
          header: 'Upload Files',  
          subHeader: '',  
          message: 'Choose from gallery',  
        });  
        await alert.present();  
        const result = await alert.onDidDismiss();  
        console.log(result);  
      }
}
