import { Injectable,EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class DataShareServiceService {
 //Usage of search medecine 
  MedicineData: EventEmitter<any> = new EventEmitter<any>(null);
  medicineData:any=[];

// medicine saltList
  MedicineSaltList: EventEmitter<any> = new EventEmitter<any>(null);
  medicineSaltList:any=[];

  // blog data
  BlogData: EventEmitter<any> = new EventEmitter<any>(null);
  blogdata:any=[];

  // Set Geocoordinatates
  Latitude: EventEmitter<any> = new EventEmitter<any>(null);
  latitudeValue:any=[];

  // Set Geocoordinatates
  Longitude: EventEmitter<any> = new EventEmitter<any>(null);
  longitudeValue:any=[];

  // Set Current Postalcode
  PostalCode: EventEmitter<any> = new EventEmitter<any>(null);
  userpostalcode:any=[];

  // Set Userdeatil
  UserDetails: EventEmitter<any> = new EventEmitter<any>(null);
  userdetails:any=[];

//Elab card Master 
  setCardmasterData: EventEmitter<any> = new EventEmitter<any>(null);
  cardmasterData:any=[];
  cardList: EventEmitter<any> = new EventEmitter<any>(null);
  storeCardList:any=[];
  childDataList: EventEmitter<any> = new EventEmitter<any>(null);
  childCardData: any = [];

  ParentCardId: EventEmitter<any> = new EventEmitter<any>(null);
  parentcardid: any = [];

//Usage of search medecine 
  setmedecineData(responce){
    this.MedicineData.emit(responce);
    this.medicineData = responce;
  }
  getmedicineData(){
    return this.medicineData;
  }
// blogs
  setblogdata(responce){
    this.BlogData.emit(responce);
    this.blogdata = responce;
  }
  getblogdata(){
    return this.blogdata;
  }

  // User latitude
  setCurrentLatitude(responce){
    this.Latitude.emit(responce);
    this.latitudeValue = responce;
  }
  getCurrentLatitude(){
    return this.latitudeValue;
  }

  // User Longitude
  setCurrentLongitude(responce){
    this.Longitude.emit(responce);
    this.longitudeValue = responce;
  }
  getCurrentLongitude(){
    return this.longitudeValue;
  }

  //UserDetails
  setUserDetails(responce){
    this.UserDetails.emit(responce);
    this.userdetails = responce;
  }
  getUserDetails(){
    return this.userdetails;
  }
  
  //UserPostalCode
  setUserPostalCode(responce){
    this.PostalCode.emit(responce);
    this.userpostalcode = responce;
  }
  getUserPostalCode(){
    return this.userpostalcode;
  }


  setmedicineSaltList(responce){
    this.MedicineSaltList.emit(responce);
    this.medicineSaltList = responce;
  }
  getmedicineSaltList(){
    return this.medicineSaltList;
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
  gettCardList(){
    return this.storeCardList;
  }
  
  setchildDataList(responce){
    this.childDataList.emit(responce);
    this.childCardData = responce;
  }
  getchildCardData(){
    return this.childCardData;
  }

  setParentCardId(responce){
    this.ParentCardId.emit(responce);
    this.parentcardid = responce;
  }
  getParentCardId(){
    return this.parentcardid;
  }
  
}
