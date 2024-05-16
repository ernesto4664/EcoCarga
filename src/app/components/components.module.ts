import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from './layout/layout.component';
import { IonicModule } from '@ionic/angular';

@NgModule({
  declarations: [
    LayoutComponent  // Declara el componente aquí
  ],
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [
    LayoutComponent  // Exporta el componente para que pueda ser usado en otros módulos
  ]
})
export class ComponentsModule {}
