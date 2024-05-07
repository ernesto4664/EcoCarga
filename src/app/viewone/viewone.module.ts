import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComponentsModule } from '../components/components.module';
import { IonicModule } from '@ionic/angular';

import { ViewonePageRoutingModule } from './viewone-routing.module';

import { ViewonePage } from './viewone.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewonePageRoutingModule,
    ComponentsModule
  ],
  declarations: [ViewonePage]
})
export class ViewonePageModule {}
