import { Injectable } from '@angular/core';
import { AlertController, AlertOptions, ModalController, ModalOptions, PopoverController, PopoverOptions } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class PopoverModalService {

  constructor(
    private alertCtrl: AlertController,
    private modalController: ModalController, 
    private popoverCtrl: PopoverController
  ) { }

  async getModal(component: any, componentProps?: any, mode?: 'md' | 'ios', cssClass?: string | string[], back_dis?: boolean,id?:any): Promise<HTMLIonModalElement> {
    let backdropDismiss = back_dis === false ? false : true;
    return await this.modalController.create({
      component,
      animated: true,
      componentProps,
      mode: mode || 'ios',
      keyboardClose: true,
      cssClass,
      backdropDismiss,
      id:id
    });
  }

async presentModal(anyComponent:any, data:any) {
  let id:any = anyComponent.toLowerCase;
  const modal = await this.modalController.create({
    component: anyComponent,
    cssClass: id+"-class",
    componentProps: {
      'Data': data,
    },
    animated: true,
    keyboardClose: true,
    id:id
  });
  modal.present();
  return await modal.onDidDismiss()
        .then((data) => {
          return data;
      });
}

  async getPopover(component: any, event?: any, componentProps?: any, mode?: 'md' | 'ios', cssClass?: string | string[]): Promise<HTMLIonPopoverElement> {
    return await this.popoverCtrl.create({
      cssClass: cssClass ? cssClass : [],
      component,
      animated: true,
      componentProps,
      mode: mode || 'ios',
      backdropDismiss: true,
      event: event ? event : null
    });
  }
  dismiss() {
    // can "dismiss" itself and optionally pass back data
    this.modalController.dismiss(null, 'cancel');
  }
  /* -----Genric Services-------------- */
  public async dismissModal(data?: any,role?:string,id?:string): Promise<boolean> {
    return this.modalController.dismiss(data,role,id);
  }

  public async showAlert(opts?: AlertOptions): Promise<HTMLIonAlertElement> {
    const alert = await this.alertCtrl.create(opts);
    await alert.present();
    return alert;
  }

  public async showErrorAlert(
    opts?: AlertOptions
  ): Promise<HTMLIonAlertElement> {
    const defaultOpts: AlertOptions = {
      header: 'Error',
      buttons: ['OK'],
    };
    opts = { ...defaultOpts, ...opts };
    return this.showAlert(opts);
  }

  public async showModal(opts: ModalOptions): Promise<HTMLIonModalElement> {
    const modal = await this.modalController.create(opts);
    await modal.present();
    return modal;
  }

  public async showPopover(
    opts: PopoverOptions
  ): Promise<HTMLIonPopoverElement> {
    const popover = await this.popoverCtrl.create(opts);
    await popover.present();
    return popover;
  }

}
