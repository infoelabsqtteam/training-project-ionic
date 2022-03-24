import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FormComponent } from './common-component/form/form.component';
import { MCoreComponent } from './m-core.component';

const routs : Routes = [
        {path: '', component: MCoreComponent, children:[
            {path:'form',component:FormComponent}
            ],
            runGuardsAndResolvers: 'always'
        },
    ];

@NgModule({
    imports : [
        RouterModule.forChild(routs)
        ],
    exports:[
        RouterModule
        ]
    
})
export class McoreRoutingModule{
    
}