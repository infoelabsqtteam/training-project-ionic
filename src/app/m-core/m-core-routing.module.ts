import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CardDetailViewPageModule } from './builder/card-detail-view/card-detail-view.module';
import { CardViewPageRoutingModule } from './builder/card-view/card-view-routing.module';
import { ChartComponent } from './common-component/chart/chart.component';
import { FormComponent } from './common-component/form/form.component';
import { MCoreComponent } from './m-core.component';
import { MongodbChartComponent } from './common-component/mongodb-chart/mongodb-chart.component';

const routs : Routes = [
        {
            path: '', 
            component: MCoreComponent, 
            children:[
                {path:'form',component:FormComponent},
                {path:'card-view',loadChildren: () => import('../m-core/builder/card-view/card-view.module').then(m => m.CardViewPageModule)},
                {path:'card-detail-view',loadChildren: () => import('../m-core/builder/card-detail-view/card-detail-view.module').then(m => m.CardDetailViewPageModule)},
                {path:'chart', component:ChartComponent},
                {path:'mongochart', component:MongodbChartComponent},
            ],
            runGuardsAndResolvers: 'always'
        },
    ];

@NgModule({
    imports : [
        RouterModule.forChild(routs),
        CardViewPageRoutingModule,
        ],
    exports:[
        RouterModule
        ]
    
})
export class McoreRoutingModule{
    
}