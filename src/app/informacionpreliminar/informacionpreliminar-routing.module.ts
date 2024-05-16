import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InformacionpreliminarPage } from './informacionpreliminar.page';

const routes: Routes = [
  {
    path: '',
    component: InformacionpreliminarPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InformacionpreliminarPageRoutingModule {}
