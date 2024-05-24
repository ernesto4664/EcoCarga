import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FirstSearchPage } from './first-search.page';

const routes: Routes = [
  {
    path: '',
    component: FirstSearchPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FirstSearchPageRoutingModule {}
