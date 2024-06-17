import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { TermsModalComponent } from '../components/terms-modal/terms-modal.component';

@Component({
  selector: 'app-viewone',
  templateUrl: './viewone.page.html',
  styleUrls: ['./viewone.page.scss'],
})
export class ViewonePage implements OnInit {
  termsAccepted = false;  // Propiedad para rastrear la aceptación de términos
  showAlert = false; // Variable para controlar la visibilidad de la alerta

  alertButtons = [
    {
      text: 'Continuar',
      handler: () => {
        // No se necesita una acción adicional aquí, el botón cerrará la alerta automáticamente
      }
    }
  ];

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
      console.error("Error al crear modal: ", error);
    }
  }

  ngOnInit() {
    this.route.url.subscribe(url => console.log('URL actual:', url));
  }

  navigateToInformacionPreliminar() {
    if (this.termsAccepted) {
      console.log("Navegando a la página de información preliminar");
      this.router.navigateByUrl('/informacionpreliminar').then(success => {
        if (success) {
          console.log('Navegación exitosa');
        } else {
          console.log('Error de navegación');
        }
      });
    } else {
      this.showAlert = true; // Mostrar la alerta si los términos no han sido aceptados
    }
  }

  onAlertDismiss() {
    this.showAlert = false; // Resetear la visibilidad de la alerta al cerrarla
  }
}
