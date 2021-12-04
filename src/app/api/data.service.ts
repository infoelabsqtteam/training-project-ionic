import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  // apiurl = "https://jsonplaceholder.typicode.com";

   apiurl = "assets/data/cards.json";
   apiurl2 = "assets/data/card_data.json";
  //apiurl = "https://uatserverqualiteklab.e-labs.ai/rest/";
  serverdata: any;


  constructor(private http: HttpClient) { }

  getlocaldata(){
    return this.http.get(this.apiurl + '/posts');
  }

  getphoto(){
    return this.http.get(this.apiurl + '/photos');
  }

 getphotodata(id) {
  return this.http.get(this.apiurl + '/photos' + id);
 }

 
 getlocalserverdata(){
  return this.http.get(this.apiurl2);
  }

}
