import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { LayoutComponent } from './layout/layout.component';

@NgModule({
  declarations: [
    LayoutComponent  // Asegúrate de que está declarado aquí
  ],
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [
    LayoutComponent  // Y que también está siendo exportado
  ]
})
export class ComponentsModule {}