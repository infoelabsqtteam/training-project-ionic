import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModuleListPageRoutingModule } from './module-list-routing.module';

import { ModuleListPage } from './module-list.page';
import { ModalComponent } from '../component/modal/modal.component';
import { SearchModalComponent } from '../component/search-modal/search-modal.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModuleListPageRoutingModule
  ],
  declarations: [ModuleListPage, ModalComponent]
})
export class ModuleListPageModule { }
