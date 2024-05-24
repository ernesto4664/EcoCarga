import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SecondSearchPageRoutingModule } from './second-search-routing.module';

import { SecondSearchPage } from './second-search.page';
import { ComponentsModule } from "../components/components.module";

@NgModule({
    declarations: [SecondSearchPage],
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        SecondSearchPageRoutingModule,
        ComponentsModule
    ]
})
export class SecondSearchPageModule {}
