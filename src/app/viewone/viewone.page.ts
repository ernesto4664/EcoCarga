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
        this.onAlertDismiss();
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
          localStorage.setItem('termsAccepted', 'true');
         // console.log("Términos aceptados");
        } else {
         // console.log("Términos no aceptados");
        }
      });

      return await modal.present();
    } catch (error) {
      console.error("Error al crear modal: ", error);
    }
  }

  ngOnInit() {
    const termsAccepted = localStorage.getItem('termsAccepted') === 'true';
    const termsAcceptedDate = localStorage.getItem('termsAcceptedDate'); // Fecha de aceptación
  
    if (termsAccepted && termsAcceptedDate) {
     
      const currentTime = new Date().getTime();
      const acceptedTime = new Date(termsAcceptedDate).getTime();
      const oneYearInMillis = 365 * 24 * 60 * 60 * 1000; // 1 año en milisegundos
  
      // Verificar si han pasado más de 1 año desde que se aceptaron los términos
      if ((currentTime - acceptedTime) > oneYearInMillis) {
        this.termsAccepted = false; // Forzar al usuario a volver a aceptar
        localStorage.removeItem('termsAccepted'); // Eliminar el estado anterior
        localStorage.removeItem('termsAcceptedDate'); // Eliminar la fecha anterior
      } else {
        this.termsAccepted = true; // Aceptación válida dentro del año
        this.navigateToInformacionPreliminar();
      }
    } else {
      this.termsAccepted = false; // No se han aceptado los términos
    }
  
    this.route.url.subscribe(url => console.log('URL actual:', url));

    
  }

  navigateToInformacionPreliminar() {
    if (this.termsAccepted) {
      //console.log("Navegando a la página de primera busqueda");
      this.router.navigateByUrl('/first-search').then(success => {
        if (success) {
        //  console.log('Navegación exitosa');
        } else {
         // console.log('Error de navegación');
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
