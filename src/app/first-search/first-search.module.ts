import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FirstSearchPageRoutingModule } from './first-search-routing.module';

import { FirstSearchPage } from './first-search.page';
import { ComponentsModule } from "../components/components.module";

@NgModule({
    declarations: [FirstSearchPage],
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        FirstSearchPageRoutingModule,
        ComponentsModule
    ]
})
export class FirstSearchPageModule {}
