import { Injectable } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { FormComponent } from 'src/app/m-core/common-component/form/form.component';

@Injectable({
  providedIn: 'root'
})
export class PopoverModalService {

constructor(
  private modalController: ModalController, 
  private popoverController: PopoverController
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

async presentModal() {
  const modal = await this.modalController.create({
    component: FormComponent,
    cssClass: 'my-custom-class',
    componentProps: {
      'firstName': 'Douglas',
      'lastName': 'Adams',
      'middleInitial': 'N'
    }
  });
  return await modal.present();
}

async getPopover(component: any, event?: any, componentProps?: any, mode?: 'md' | 'ios', cssClass?: string | string[]): Promise<HTMLIonPopoverElement> {
  return await this.popoverController.create({
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
  // using the injected ModalController this page
  // can "dismiss" itself and optionally pass back data
  this.modalController.dismiss(null, 'cancel');
}

}
