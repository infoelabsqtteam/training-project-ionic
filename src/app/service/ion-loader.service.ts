import { Injectable, EventEmitter } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class IonLoaderService {

  constructor(public loadingController: LoadingController) { }


  // Simple loader
  async showLoader(msg: string) {
    let message;
    if (msg) {
      message = msg;
    } else {
      message = "Loading ...";
    }
    await this.loadingController.create({
      message: message,
      spinner: 'bubbles',
      keyboardClose: true,
      backdropDismiss:true,
      translucent: true,
    }).then((response) => {
      response.present();
    });
  }

  // Dismiss loader
  async hideLoader() {
    await this.loadingController.dismiss().then((response) => {
      console.log('Loader closed!', response);
    }).catch((err) => {
      console.log('Error occured : ', err);
    });
  }

  // Auto hide show loader
  async autohideLoader(msg: String) {
    let message;
    if (msg) {
      message = msg;
    } else {
      message = "Loading ...";
    }
    await this.loadingController.create({
      message: message,
      duration: 3000,
      spinner: 'bubbles',
      keyboardClose: true,
      backdropDismiss:true,
      translucent: true,
    }).then((response) => {
      response.present();
      response.onDidDismiss().then((response) => {
        console.log('Loader dismissed', response);
      });
    });
  }   

  // Custom style + hide on tap loader
  async customLoader() {
    this.loadingController.create({
      message: 'Loader with custom style',
      duration: 4000,
      cssClass:'loader-css-class',
      backdropDismiss:true
    }).then((res) => {
      res.present();
    });
  }

  //
  async showImageLoader(msg: string) {
    let message = "";
    if (msg) {
      message = msg;
    }
    // else {
    //   message = "Loading ...";
    // }
    const loading = await this.loadingController.create({
      message: message,
      spinner: "crescent",
      cssClass: "custom-loader",
      keyboardClose: true,
      backdropDismiss:true,
      translucent: true,
    });

    loading.present();

  }

}
