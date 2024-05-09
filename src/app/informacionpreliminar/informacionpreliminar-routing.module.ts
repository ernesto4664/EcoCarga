import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InformacionpreliminarPage } from './informacionpreliminar.page';

const routes: Routes = [
  {
    path: '',
    component: InformacionpreliminarPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InformacionpreliminarPageRoutingModule {}
