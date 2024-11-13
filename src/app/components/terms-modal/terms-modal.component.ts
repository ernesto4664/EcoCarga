import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { GlobalDataService } from '../../global-data.service';
import { TermsAndConditionsService } from '../../services/terms-and-conditions.service';

@Component({
  selector: 'app-terms-modal',
  templateUrl: './terms-modal.component.html',
  styleUrls: ['./terms-modal.component.scss'],
})
export class TermsModalComponent implements OnInit {
  termsAccepted = false;
  showAlert = false;
  latestTerms: any;

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
    private globalDataService: GlobalDataService,
    private termsService: TermsAndConditionsService
  ) {}

  ngOnInit() {
    this.termsService.getTermsAndConditions().subscribe(
      data => {
        this.latestTerms = data[0]; // Obtener el término más reciente
      },
      error => {
        console.error('Error fetching terms and conditions:', error);
      }
    );
  }

  dismiss() {
    this.modalController.dismiss();
  }

  accept() {
    if (this.termsAccepted) {
        localStorage.setItem('termsAccepted', 'true');
        localStorage.setItem('termsAcceptedDate', new Date().toISOString()); // Guardar fecha de aceptación
        this.globalDataService.fetchAllConnectors();
        this.modalController.dismiss({ accepted: true });
    } else {
        this.showAlert = true;
    }
}

  onAlertDismiss() {
    this.showAlert = false;
  }
}
