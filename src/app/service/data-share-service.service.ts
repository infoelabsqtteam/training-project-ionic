import { Injectable,EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataShareServiceService {

  setCardmasterData: EventEmitter<any> = new EventEmitter<any>(null);
  cardmasterData:any=[];
  cardList: EventEmitter<any> = new EventEmitter<any>(null);
  storeCardList:any=[];
  childDataList: EventEmitter<any> = new EventEmitter<any>(null);
  childCardData: any = [];


  constructor() { }

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
}
