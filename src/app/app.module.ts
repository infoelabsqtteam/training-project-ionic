import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
// import { SplashScreen } from '@awesome-cordova-plugins/splash-screen/ngx';
// import { StatusBar } from '@awesome-cordova-plugins/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
// import { MediaCapture } from '@awesome-cordova-plugins/media-capture/ngx';
// import { Media } from '@awesome-cordova-plugins/media/ngx';
// import { File } from '@awesome-cordova-plugins/file/ngx';
import { CallNumber } from '@awesome-cordova-plugins/call-number/ngx';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePipe, CurrencyPipe, TitleCasePipe} from '@angular/common';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { NativeGeocoder} from '@awesome-cordova-plugins/native-geocoder/ngx';
import { AuthInterceptor } from './shared/auth.interceptor';
import { FocusDirective } from './directive/focus.directive';
import { IonicCoreModule } from '@core/ionic-core';
import { HomePageModule } from './home/home.module';
import { McoreModule } from './m-core/m-core.module';
import { LocationAccuracy } from '@awesome-cordova-plugins/location-accuracy/ngx';
import { OpenNativeSettings } from '@awesome-cordova-plugins/open-native-settings/ngx';
import { MyLibModule } from '@core/web-core';
import { AuthModule } from './auth/auth.module';

 





@NgModule({
    declarations: [AppComponent, FocusDirective],
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        IonicModule.forRoot(),
        IonicCoreModule.forRoot(environment),
        AppRoutingModule,
        ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
        McoreModule,
        AuthModule,
        MyLibModule.forRoot(environment)
    ],
    providers: [
        // StatusBar,
        // SplashScreen,
        // MediaCapture,
        // Media,
        File,
        CallNumber,
        DatePipe,
        CurrencyPipe,
        FileOpener,
        AndroidPermissions,
        NativeGeocoder,
        LocationAccuracy,
        OpenNativeSettings,
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
        TitleCasePipe
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
