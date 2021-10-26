import { DatePipe } from '@angular/common';
import { Component, HostListener, Input, OnInit } from '@angular/core';
import { ToastController, ModalController } from '@ionic/angular';
import { AuthService, StorageService, GallaryService } from '@core/ionic-core';

@Component({
  selector: 'app-upload-prescription',
  templateUrl: './upload-prescription.component.html',
  styleUrls: ['./upload-prescription.component.scss'],
})
export class UploadPrescriptionComponent implements OnInit {
  @Input() modalData: any;
  @Input() headerVaue: string;
  @Input() modal: any;
  list: any = [];
  presText: any = [];
  presList: any = [];

  constructor(
    private dateFormat: DatePipe,
    private authService: AuthService,
    public toastController: ToastController,
    public modalController: ModalController,
    private storageService: StorageService,
    private galleryService:GallaryService
  ) { }

  ngOnInit() {
    const modalState = {
      modal: true,
      desc: 'fake state for our modal'
    };
    history.pushState(modalState, null);
    this.list = [
      'assets/002.png',
      'assets/003.png',
      'assets/004.png',
    ];
    this.presText = [
      "Never Lose the digital copy of your prescription will be with you whrereever you go.",
      "Is your prescription hard to understand? Sanjivani wil help you in placing your order.",
      "Details from your prescription are not shared with any third party."
    ]

  }
  ionViewWillEnter() {
    this.getPresList();

  }
  async getPresList() {
    let list = await this.storageService.getObject('presData');
    if (list) {
      this.presList = list;
    }
  }


  ngOnDestroy() {
    if (window.history.state.modal) {
      history.back();
    }
  }

  @HostListener('window:popstate', ['$event'])
  dismissModal() {
    this.modal.dismiss();
  }

  _dismiss() {
    this.modal.dismiss();
  }
  async clickPicture() {
    await this.galleryService.clickPicture();
    this.getPresList();
  }
  async getImageFromGallery() {
    await this.galleryService.getImageFromGallery();
    this.getPresList();
  }
  removePres(index) {
    console.log(index);
    this.presList.splice(index, 1)
    this.storageService.setObject('presData', JSON.stringify(this.presList));
  }
}
