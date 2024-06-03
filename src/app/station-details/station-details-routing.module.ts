import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StationDetailsPage } from './station-details.page';

const routes: Routes = [
  {
    path: '',
    component: StationDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StationDetailsPageRoutingModule {}
