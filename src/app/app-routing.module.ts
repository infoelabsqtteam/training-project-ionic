import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from './auth/auth.guard';
import { TabsPage } from '../app/tabs/tabs.page';

const routes: Routes = [
  // { path: '', redirectTo: 'places', pathMatch: 'full' },
  { path: 'm-core', loadChildren: () => import('./m-core/m-core.module').then(m => m.McoreModule) },
  { path: 'auth', loadChildren: () => import('./auth/auth.module').then(m => m.AuthPageModule) },
  { path: '', loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule) },
  
  { path: '', component: TabsPage, children: [
    {
      path: 'home', children: [
        { path: '', loadChildren: () => import('./home/home.module').then(m => m.HomePageModule), canLoad: [AuthGuard] }
      ]
    },
    {
      path: 'crm/quotation', children: [
        { path: '', loadChildren: () => import('./crm/quotation/quotation.module').then(m => m.QuotationPageModule), canLoad: [AuthGuard] }
      ]
    },
    {
      path: 'crm/quotation-details', children: [
        { path: '', loadChildren: () => import('./crm/quotation-details/quotation-details.module').then(m => m.QuotationDetailsPageModule), canLoad: [AuthGuard] }
      ]
    },
    {
      path: 'crm/contact-details', children: [
        { path: '', loadChildren: () => import('./crm/contact-details/contact-details.module').then(m => m.ContactDetailsPageModule), canLoad: [AuthGuard] }
      ]
    },
    
  ]
},
  { path: 'home', loadChildren: () => import('./home/home.module').then( m => m.HomePageModule) },
  { path: 'tab', loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule) },
  { path: 'charts', loadChildren: () => import('./pages/charts/charts.module').then( m => m.ChartsPageModule) },
  
  { path: 'crm/contact', loadChildren: () => import('./crm/contact/contact.module').then( m => m.ContactPageModule)},
  { path: 'crm/addcontact', loadChildren: () => import('./crm/addcontact/addcontact.module').then( m => m.AddcontactPageModule)},
  { path: 'crm/contact-details', loadChildren: () => import('./crm/contact-details/contact-details.module').then( m => m.ContactDetailsPageModule) },
  { path: 'crm/contact-quotation', loadChildren: () => import('./crm/contact-quotation/contact-quotation.module').then( m => m.ContactQuotationPageModule) },
  { path: 'crm/enquiry',loadChildren: () => import('./crm/enquiry/enquiry.module').then( m => m.EnquiryPageModule)},
  { path: 'crm/enquiry-details', loadChildren: () => import('./crm/enquiry-details/enquiry-details.module').then( m => m.EnquiryDetailsPageModule) },
  { path: 'crm/add-enquiry', loadChildren: () => import('./crm/add-enquiry/add-enquiry.module').then( m => m.AddEnquiryPageModule)},
  { path: 'crm/quotation', loadChildren: () => import('./crm/quotation/quotation.module').then( m => m.QuotationPageModule) },
  { path: 'crm/addquotation', loadChildren: () => import('./crm/addquotation/addquotation.module').then( m => m.AddquotationPageModule) },
  { path: 'crm/quotation-details', loadChildren: () => import('./crm/quotation-details/quotation-details.module').then( m => m.QuotationDetailsPageModule) },
  { path: 'crm/whatsapp-chat', loadChildren: () => import('./crm/whatsapp-chat/whatsapp-chat.module').then( m => m.WhatsappChatPageModule) },  {
    path: 'image-upload',
    loadChildren: () => import('./pages/image-upload/image-upload.module').then( m => m.ImageUploadPageModule)
  },











];

@NgModule({
  imports: [RouterModule.forRoot(routes, {onSameUrlNavigation: 'reload'})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
