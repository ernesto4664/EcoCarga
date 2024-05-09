// informacionpreliminar.module.ts
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { InformacionpreliminarPage } from './informacionpreliminar.page';
import { register } from 'swiper/element/bundle';

register();

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    // otros imports necesarios
  ],
  declarations: [InformacionpreliminarPage],
})
export class InformacionpreliminarPageModule {}
