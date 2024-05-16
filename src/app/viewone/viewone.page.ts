import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { ModalController } from '@ionic/angular';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

import { TermsModalComponent } from '../components/terms-modal/terms-modal.component'; // Verifica esta ruta

@Component({
  selector: 'app-viewone',
  templateUrl: './viewone.page.html',
  styleUrls: ['./viewone.page.scss'],
})
export class ViewonePage implements OnInit {
  termsAccepted = false;  // Propiedad para rastrear la aceptación de términos

  constructor(private router: Router, private route: ActivatedRoute, private modalController: ModalController) {}
  
  async openTermsModal() {
    try {
      const modal = await this.modalController.create({
        component: TermsModalComponent
      });

      modal.onDidDismiss().then((data) => {
        if (data.data && data.data.accepted) {
          this.termsAccepted = true;
        }
      });

      return await modal.present();
    } catch (error) {
      console.error("Error creating modal: ", error);
    }
  }

  ngOnInit() {
    this.route.url.subscribe(url => console.log('Current URL:', url));
  }

  navigateToInformacionPreliminar() {
    if (this.termsAccepted) {
      console.log("Navigating to InformacionpreliminarPage");
      this.router.navigateByUrl('/informacionpreliminar').then(success => {
        if (success) {
          console.log('Navigation successful');
        } else {
          console.log('Navigation failed');
        }
      });
    } else {
      alert('Debes aceptar los términos y condiciones para continuar.');
    }
  }
}
