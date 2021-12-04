import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from './auth/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'places', pathMatch: 'full' },
  { path: 'auth', loadChildren: () => import('./auth/auth.module').then(m => m.AuthPageModule) },
  {
    path: 'places',
    loadChildren: () => import('./places/places.module').then(m => m.PlacesPageModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'bookings',
    loadChildren: () => import('./bookings/bookings.module').then(m => m.BookingsPageModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'module-list',
    loadChildren: () => import('./module-list/module-list.module').then(m => m.ModuleListPageModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardPageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'home2',
    loadChildren: () => import('./home2/home2.module').then( m => m.Home2PageModule)
  },
  {
    path: 'home3',
    loadChildren: () => import('./home3/home3.module').then( m => m.Home3PageModule)
  },
  {
    path: 'item-search',
    loadChildren: () => import('./pages/item-search/item-search.module').then(m => m.ItemSearchPageModule)
  },

  {
    path: 'checkout',
    loadChildren: () => import('./pages/checkout/checkout.module').then(m => m.CheckoutPageModule)
  },
  {
    path: 'cat',
    loadChildren: () => import('./pages/category-list/category-list.module').then(m => m.CategoryListPageModule)
  },
  {
    path: 'tab',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'orders',
    loadChildren: () => import('./orders/orders.module').then( m => m.OrdersPageModule)
  },
  {
    path: 'leads',
    loadChildren: () => import('./leads/leads.module').then(m => m.LeadsPageModule),
    canLoad: [AuthGuard]
  },

  {
    path: 'task',
    loadChildren: () => import('./pages/task/task.module').then(m => m.TaskPageModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'lrtab',
    loadChildren: () => import('./lead-reminder-tab/lead-reminder-tab.module').then(m => m.LeadReminderTabPageModule)
  },
  {
    path: 'notification',
    loadChildren: () => import('./pages/notification/notification.module').then( m => m.NotificationPageModule)
  },
  {
    path: 'order-summary',
    loadChildren: () => import('./pages/order-summary/order-summary.module').then(m => m.OrderSummaryPageModule)
  },
  {
    path: 'product-details',
    loadChildren: () => import('./pages/product-details/product-details.module').then(m => m.ProductDetailsPageModule)
  },
  {
    path: 'home4',
    loadChildren: () => import('./home4/home4.module').then( m => m.Home4PageModule)
  },
  {
    path: 'modalh4details',
    loadChildren: () => import('./component/modalh4/modalh4.component').then( m => m.Modalh4Component)
  },
  {
    path: 'teams',
    loadChildren: () => import('./pages/teams/teams.module').then( m => m.TeamsPageModule)
  },
  {
    path: 'cardview',
    loadChildren: () => import('./pages/cardview/cardview.module').then( m => m.CardviewPageModule)
  },
  {
    path: 'carddetailview',
    loadChildren: () => import('./pages/carddetailview/carddetailview.module').then( m => m.CarddetailviewPageModule)
  },









];

@NgModule({
  imports: [RouterModule.forRoot(routes, {onSameUrlNavigation: 'reload'})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
