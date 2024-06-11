// informacionpreliminar.module.ts
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentsModule } from '../components/components.module';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { InformacionpreliminarPageRoutingModule } from './informacionpreliminar-routing.module';
import { InformacionpreliminarPage } from './informacionpreliminar.page';
import { register } from 'swiper/element/bundle';

register();

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    InformacionpreliminarPageRoutingModule
    
  ],
  declarations: [InformacionpreliminarPage],
})
export class InformacionpreliminarPageModule {}
