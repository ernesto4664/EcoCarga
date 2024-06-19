import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; 
import { IonicModule } from '@ionic/angular';

import { ContactUsPageRoutingModule } from './contact-us-routing.module';

import { ContactUsPage } from './contact-us.page';
import { ComponentsModule } from "../components/components.module";

@NgModule({
    declarations: [ContactUsPage],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule, 
        IonicModule,
        ContactUsPageRoutingModule,
        ComponentsModule
    ]
})
export class ContactUsPageModule {}
