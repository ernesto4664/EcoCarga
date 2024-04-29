import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewonePage } from './viewone.page';

const routes: Routes = [
  {
    path: '',
    component: ViewonePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewonePageRoutingModule {}
