import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ElectrolinerasPage } from './electrolineras.page';
import { ComponentsModule } from "../components/components.module";
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@NgModule({
  declarations: [ElectrolinerasPage],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild([{ path: '', component: ElectrolinerasPage }]),
    ComponentsModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]  // Añade esto
})
export class ElectrolinerasPageModule {}
