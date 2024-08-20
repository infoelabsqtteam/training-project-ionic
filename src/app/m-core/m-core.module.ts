import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonComponentModule } from './common-component/common-component.module';
import { McoreRoutingModule } from './m-core-routing.module';
import { ModalModule } from './modal/modal.module';
import { MyScannerModule } from './scanner/scanner.module';


@NgModule({
    declarations: [
       
    ],
    imports: [
        McoreRoutingModule,
        CommonComponentModule,
        ModalModule,
        MyScannerModule
    ],
    // schemas: [
    //     CUSTOM_ELEMENTS_SCHEMA,
    //     NO_ERRORS_SCHEMA
    // ]

})
export class McoreModule {

}