import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ViewonePageRoutingModule } from './viewone-routing.module';

import { ViewonePage } from './viewone.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewonePageRoutingModule
  ],
  declarations: [ViewonePage]
})
export class ViewonePageModule {}
