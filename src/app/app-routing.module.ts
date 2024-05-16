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
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
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