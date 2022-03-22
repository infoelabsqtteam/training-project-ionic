import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HomePageRoutingModule } from './home-routing.module';
import { HomePage } from './home.page';
import { SwiperModule } from 'swiper/angular';
import { ProductSearchComponent } from '../component/product-search/product-search.component';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    SwiperModule,
    HomePageRoutingModule
  ],
  declarations: [
    HomePage,
    ProductSearchComponent
  ]
})
export class HomePageModule {
  


}
