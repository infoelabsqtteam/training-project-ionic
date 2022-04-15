import { NgModule } from '@angular/core';
import { CommonComponentModule } from './common-component/common-component.module';
import { McoreRoutingModule } from './m-core-routing.module';
import { ModalModule } from './modal/modal.module';


@NgModule({
    declarations: [
       
    ],
    imports: [
        McoreRoutingModule,
        CommonComponentModule,
        ModalModule
    ]

})
export class McoreModule {

}