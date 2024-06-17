import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // Asegúrate de importar ReactiveFormsModule
import { IonicModule } from '@ionic/angular';

import { ContactUsPageRoutingModule } from './contact-us-routing.module';

import { ContactUsPage } from './contact-us.page';
import { ComponentsModule } from "../components/components.module";

@NgModule({
    declarations: [ContactUsPage],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule, // Agrega ReactiveFormsModule aquí
        IonicModule,
        ContactUsPageRoutingModule,
        ComponentsModule
    ]
})
export class ContactUsPageModule {}
