import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../auth/auth.guard';

import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'home2',
        children: [
          {
            path: '',
            loadChildren: () => import('../home2/home2.module').then(m => m.Home2PageModule),
            canLoad: [AuthGuard]
          }
        ]
      },
      {
        path: 'cart-items',
        children: [
          {
            path: '',
            loadChildren: () => import('../pages/cart-items/cart-items.module').then(m => m.CartItemsPageModule),
            canLoad: [AuthGuard]
          }
        ]
      },
      {
        path: 'store',
        children: [
          {
            path: '',
            loadChildren: () => import('../pages/store/store.module').then(m => m.StorePageModule),
            canLoad: [AuthGuard]
          }
        ]
      },
      {
        path: 'support',
        children: [
          {
            path: '',
            loadChildren: () => import('../pages/support/support.module').then(m => m.SupportPageModule),
            canLoad: [AuthGuard]
          }
        ]
      },
      {
        path: '',
        redirectTo: '/tab/home2',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tab/home2',
    pathMatch: 'full'
  }

];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule { }
