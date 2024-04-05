import { Injectable,EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataShareServiceService {
  
  Latitude: EventEmitter<any> = new EventEmitter<any>(null); // Set Geocoordinatates
  latitudeValue:any=[];  
  Longitude: EventEmitter<any> = new EventEmitter<any>(null); // Set Geocoordinatates
  longitudeValue:any=[];  
  PostalCode: EventEmitter<any> = new EventEmitter<any>(null); // Set Current Postalcode
  userpostalcode:any=[];
  //Below Elabs card Master 
  setCardmasterData: EventEmitter<any> = new EventEmitter<any>(null);
  cardmasterData:any=[];
  cardList: EventEmitter<any> = new EventEmitter<any>(null);
  storeCardList:any=[];
  childDataList: EventEmitter<any> = new EventEmitter<any>(null);
  childCardData: any = [];
  setcollectionName: EventEmitter<any> = new EventEmitter<any>(null);
  collectionName: any = '';
  confirmationCheck: Subject<any> = new Subject();
  gridDownloadImage: Subject<any> = new Subject();

  setCurrentLatitude(responce){
    this.Latitude.emit(responce);
    this.latitudeValue = responce;
  }
  getCurrentLatitude(){
    return this.latitudeValue;
  }
  setCurrentLongitude(responce){
    this.Longitude.emit(responce);
    this.longitudeValue = responce;
  }
  getCurrentLongitude(){
    return this.longitudeValue;
  }
  setUserPostalCode(responce){
    this.PostalCode.emit(responce);
    this.userpostalcode = responce;
  }
  getUserPostalCode(){
    return this.userpostalcode;
  }
  //Elab card Master 
  setcardData(responce){
    this.setCardmasterData.emit(responce);
    this.cardmasterData = responce;
  }
  getCardMasterData(){
    return this.cardmasterData;
  }
  setCardList(responce){
    this.cardList.emit(responce);
    this.storeCardList = responce;
  }
  getCardList(){
    return this.storeCardList;
  }  
  setchildDataList(responce){
    this.childDataList.emit(responce);
    this.childCardData = responce;
  }
  getchildCardData(){
    return this.childCardData;
  }
  // set Collection name ratherthan currentMenu.name
  setCollectionName(responce){
    this.setcollectionName.emit(responce);
    this.collectionName = responce;
  }
  getCollectionName(){
    return this.collectionName;
  }
  setConfirmation(responce:any){
    this.confirmationCheck.next(responce);
  }
  setDownloadimage(responce){
    this.gridDownloadImage.next(responce);
  }
  
}
