
import { Component, HostListener, Input, OnInit } from '@angular/core';
import { ToastController, ModalController } from '@ionic/angular';
import { AuthService, StorageService, App_googleService,LocationAddress } from '@core/ionic-core';

@Component({
  selector: 'app-add-address',
  templateUrl: './add-address.component.html',
  styleUrls: ['./add-address.component.scss'],
})
export class AddAddressComponent implements OnInit {
  @Input() modalData: any;
  @Input() headerVaue: string;
  @Input() modal: any;
  addressList: any = [];
  address: any = {};
  addNewAddress: boolean = false;
  name: string = '';
  autocompleteItems: any = [];
  savedAddress: boolean = false;
  constructor(
    private authService: AuthService,
    public toastController: ToastController,
    public modalController: ModalController,
    private storageService : StorageService,
    private googleServie:App_googleService
  ) { }

  ngOnInit() {
    const modalState = {
      modal: true,
      desc: 'fake state for our modal'
    };
    history.pushState(modalState, null);

  }
  ionViewWillEnter() {
    this.getAddrList();
    console.log(this.modalData)

  }
  async getAddrList() {
    let list = await this.storageService.getObject('address');
    if (list) {
      this.addressList = list;
    } else {
      this.addNewAddress = true;
    }
  }

  ngOnDestroy() {
    if (window.history.state.modal) {
      history.back();
    }
  }

  @HostListener('window:popstate', ['$event'])
  dismissModal() {
    this.modal.dismiss(null);
  }

  _dismiss() {
    this.modal.dismiss(null);
  }
  addAddress() {
    this.addNewAddress = true;
    this.address = {};
  }
  newAddress() {
    this.modalData.searchAddress = true;
    this.savedAddress = false;
    this.modalData.newAddress = false;
    this.address = {};
  }
  saveNewAddress() {
    this.address.address = this.modalData.address;
    this.address.locality = this.modalData.locality;
    this.address.pincodes = this.modalData.pincodes;
    this.address.lat = this.modalData.lat;
    this.address.lng = this.modalData.lng;
    this.address.selected = true;
    let list = [];
    if (this.addressList && this.addressList.length > 0) {
      list = this.addressList;
    }
    list.push(this.address)
    this.storageService.setObject('address', JSON.stringify(list));
    this.getAddrList();
    this.modalData.newAddress = false;
    this.address = {};
    this.showSavedAddress();
  }
  async onChangeValue(value) {
    if (value && value.length > 3) {
      this.autocompleteItems = await this.googleServie.searchPlaces(value);
    }
  }
  async getFullAddress(place) {
    const address = await this.googleServie.getPlace(place.place_id);
    this.modalData.address = address['formatted_address'];
    this.modalData.locality = this.googleServie.extractFromAdress(address['address_components'], "locality");
    this.modalData.pincode = this.googleServie.extractFromAdress(address['address_components'], "postal_code");
    this.modalData.lat = address['geometry'].location.lat();
    this.modalData.lng = address['geometry'].location.lng();
    if (this.modalData.searchNewLocality) {
      let currentLocation: LocationAddress = {
        address: this.modalData.address,
        locality: this.modalData.locality,
        lat: this.modalData.lat,
        lng: this.modalData.lng
      }
      this.googleServie.setLocation(currentLocation);
      this.modalData.searchNewLocality = false;
      this.modal.dismiss(address);
    } else {
      this.modalData.newAddress = true;
      this.modalData.searchAddress = false;
      this.savedAddress = false;
    }
  }
  showSavedAddress() {
    this.modalData.newAddress = false;
    this.modalData.searchAddress = false;
    this.savedAddress = true;
  }
  onClose(name) {
    this.name = "";
    this.autocompleteItems = [];
  }
  selectAddress(address, index) {
    this.addressList[index].selected = true;
    this.addressList.forEach((element, i) => {
      if (index === i) {
        element.selected = true;
      } else {
        element.selected = false;
      }
    });
    this.storageService.setObject('address', JSON.stringify(this.addressList));
    let currentLocation: LocationAddress = {
      address: this.addressList[index].address,
      locality: this.addressList[index].locality,
      lat: this.addressList[index].lat,
      lng: this.addressList[index].lng
    }
    this.googleServie.setLocation(currentLocation);
    setTimeout(() => this.modal.dismiss(address), 1000);

  }


}
