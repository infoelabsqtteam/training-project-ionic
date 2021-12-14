import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WhatsappChatPageRoutingModule } from './whatsapp-chat-routing.module';

import { WhatsappChatPage } from './whatsapp-chat.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WhatsappChatPageRoutingModule
  ],
  declarations: [WhatsappChatPage]
})
export class WhatsappChatPageModule {}
