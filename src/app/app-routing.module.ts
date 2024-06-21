import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { InformacionpreliminarPage } from './informacionpreliminar/informacionpreliminar.page';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'welcome',
    pathMatch: 'full'
  },
  {
    path: 'welcome',
    loadChildren: () => import('./welcome/welcome.module').then(m => m.WelcomePageModule)
  },
  {
    path: 'viewone',
    loadChildren: () => import('./viewone/viewone.module').then(m => m.ViewonePageModule)
  },
  { 
    path: 'informacionpreliminar',
    loadChildren: () => import('./informacionpreliminar/informacionpreliminar.module').then(m => m.InformacionpreliminarPageModule) 
  },
  {
    path: 'electrolineras',
    loadChildren: () => import('./electrolineras/electrolineras.module').then( m => m.ElectrolinerasPageModule)
  },
  {
    path: 'first-search',
    loadChildren: () => import('./first-search/first-search.module').then( m => m.FirstSearchPageModule)
  },
  {
    path: 'second-search',
    loadChildren: () => import('./second-search/second-search.module').then( m => m.SecondSearchPageModule)
  },
  {
    path: 'station-details',
    loadChildren: () => import('./station-details/station-details.module').then( m => m.StationDetailsPageModule)
  },
  {
    path: 'contact-us',
    loadChildren: () => import('./contact-us/contact-us.module').then( m => m.ContactUsPageModule)
  },
  {
    path: '**',
    redirectTo: 'welcome',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}