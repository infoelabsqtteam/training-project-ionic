import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { MediaCapture } from '@ionic-native/media-capture/ngx';
import { Media } from '@ionic-native/media/ngx';
import { File } from '@ionic-native/File/ngx';
import { CallNumber } from '@ionic-native/call-number/ngx';
// import { CallLog } from '@ionic-native/call-log/ngx';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePipe, CurrencyPipe} from '@angular/common';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';
import { AuthInterceptor } from './shared/auth.interceptor';
import { FocusDirective } from './directive/focus.directive';
import { IonicCoreModule } from '@core/ionic-core';



@NgModule({
  declarations: [AppComponent, FocusDirective],
  entryComponents: [],
  imports: [
    BrowserModule, 
    FormsModule, 
    ReactiveFormsModule, 
    HttpClientModule, 
    IonicModule.forRoot(), 
    IonicCoreModule.forRoot(environment),
    AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js', 
    { enabled: environment.production })
  ],
  providers: [
    StatusBar,
    SplashScreen,
    MediaCapture,
    Media,
    File,
    CallNumber,
    DatePipe,
    CurrencyPipe,
    FileOpener,
    AndroidPermissions,
    NativeGeocoder,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
