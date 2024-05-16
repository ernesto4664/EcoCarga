import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-terms-modal',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Términos y Condiciones</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">Cerrar</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <p>Aquí van los términos y condiciones...</p>
      <ion-item>
        <ion-label>Acepto los términos y condiciones</ion-label>
        <ion-checkbox slot="start" [(ngModel)]="termsAccepted"></ion-checkbox>
      </ion-item>
      <ion-button expand="full" (click)="accept()">Aceptar</ion-button>
    </ion-content>
  `,
})
export class TermsModalComponent {
  termsAccepted = false;

  constructor(private modalController: ModalController) {}

  dismiss() {
    this.modalController.dismiss();
  }

  accept() {
    if (this.termsAccepted) {
      this.modalController.dismiss({ accepted: true });
    } else {
      alert('Debes aceptar los términos y condiciones para continuar.');
    }
  }
}
