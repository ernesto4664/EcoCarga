import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { GlobalDataService } from '../../global-data.service';

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

  constructor(
    private modalController: ModalController,
    private globalDataService: GlobalDataService
  ) {}

  dismiss() {
    this.modalController.dismiss();
  }

  accept() {
    if (this.termsAccepted) {
      // Guardar el estado de aceptación en localStorage
      localStorage.setItem('termsAccepted', 'true');
      
      // Llamamos a la función para adelantar la consulta a la API
      this.globalDataService.fetchAllConnectors();

      this.modalController.dismiss({ accepted: true });
    } else {
      this.showAlert = true; // Mostrar la alerta si los términos no han sido aceptados
    }
  }

  onAlertDismiss() {
    this.showAlert = false; // Resetear la visibilidad de la alerta al cerrarla
  }
}
