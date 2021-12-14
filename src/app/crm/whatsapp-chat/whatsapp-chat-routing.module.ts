import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WhatsappChatPage } from './whatsapp-chat.page';

const routes: Routes = [
  {
    path: '',
    component: WhatsappChatPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WhatsappChatPageRoutingModule {}
