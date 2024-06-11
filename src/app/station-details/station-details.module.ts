import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { StationDetailsPageRoutingModule } from './station-details-routing.module';
import { StationDetailsPage } from './station-details.page';

import { ComponentsModule } from "../components/components.module";

@NgModule({
    declarations: [StationDetailsPage] 
    ,
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        StationDetailsPageRoutingModule,
        ComponentsModule
    ]
})
export class StationDetailsPageModule {}