import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-terms-modal',
  templateUrl: './terms-modal.component.html',
  styleUrls: ['./terms-modal.component.scss'],
})
export class TermsModalComponent {
  termsAccepted = false;
  showAlert = false;

  alertButtons = [
    {
      text: 'Continuar',
      handler: () => {
        // No se necesita una acción adicional aquí, el botón cerrará la alerta automáticamente
      }
    }
  ];

  constructor(private modalController: ModalController) {}

  dismiss() {
    this.modalController.dismiss();
  }

  accept() {
    if (this.termsAccepted) {
      this.modalController.dismiss({ accepted: true });
    } else {
      this.showAlert = true; // Mostrar la alerta si los términos no han sido aceptados
    }
  }

  onAlertDismiss() {
    this.showAlert = false; // Resetear la visibilidad de la alerta al cerrarla
  }
}
