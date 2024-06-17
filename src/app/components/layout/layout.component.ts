import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {
  showMenu = false;

  constructor(private router: Router) {}

  toggleMenu() {
    this.showMenu = !this.showMenu;
  }

  navigateToElectrolineras() {
    console.log('Navegacion a ElectrolinerasPage');
    this.router.navigate(['/electrolineras']).then(success => {
      if (success) {
        console.log('Navegación a la página de Electrolineras exitosa');
      } else {
        console.log('Falló la navegación a la página de Electrolineras');
      }
    });
  }

  navigateTocontact() {
    console.log('Navegacion a contacto');
    this.router.navigate(['/contact-us']).then(success => {
      if (success) {
        console.log('Navegación a la página de contactanos exitosa');
      } else {
        console.log('Falló la navegación a la página de contactanos');
      }
    });
  }

  navigateTosearch() {
    console.log('Navegacion a busqueda');
    this.router.navigate(['/first-search']).then(success => {
      if (success) {
        console.log('Navegación a la página de busqueda exitosa');
      } else {
        console.log('Falló la navegación a la página de busqueda');
      }
    });
  }
}
