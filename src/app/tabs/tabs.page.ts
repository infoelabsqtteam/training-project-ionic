import { Component, OnInit } from '@angular/core';
import { NotificationService } from '@core/ionic-core';
import { Share } from '@capacitor/share';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { StorageService } from '@core/web-core';


@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
})
export class TabsPage implements OnInit {

  constructor(
    private notificationService:NotificationService,
    private storageService: StorageService
    ) { 
      App.addListener('appStateChange', ({ isActive }) => {
        console.log('App state changed. Is active?', isActive);
      });
      
      App.addListener('appUrlOpen', data => {
        console.log('App opened with URL:', data);
      });
      
      App.addListener('appRestoredResult', data => {
        console.log('Restored state:', data);
      });
      
      const checkAppLaunchUrl = async () => {
        const { url } = await App.getLaunchUrl();      
        console.log('App opened with URL: ' + url);
      };
    }

  ngOnInit() {
  }
  comingSoon() {
    this.notificationService.presentToastOnBottom('Comming Soon...');
  }
  async shareApp(){
    let appInfo:any = {};
    if(Capacitor.isNativePlatform()){
      appInfo = await App.getInfo();
    }else{
      appInfo = {
        'name': this.storageService.getClientCodeEnviorment().appName,
        'id' : this.storageService.getClientCodeEnviorment().appId
      }
    }
    await Share.share({
      title: appInfo.name,
      text: 'E-Labs Mobile application is perfect companion for your next generation E-Labs LIMS.',
      url: 'https://play.google.com/store/apps/details?id='+ appInfo.id,
      dialogTitle: 'Share with friends',
    });
  }

}
