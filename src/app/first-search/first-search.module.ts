import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

import { FirstSearchPage } from './first-search.page';

import { ComponentsModule } from "../components/components.module";  // Asegúrate de importar la directiva

@NgModule({
    declarations: [FirstSearchPage] // Agrega la directiva aquí
    ,
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild([{ path: '', component: FirstSearchPage }]),
        ComponentsModule
    ]
})
export class FirstSearchPageModule {}